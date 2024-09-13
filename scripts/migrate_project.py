import contextlib
import csv
import enum
import json
import logging
import os
import pathlib
import subprocess
import time

import paho.mqtt.client as mqtt
import pandas
import psycopg
import psycopg.rows
import requests
import tap
import urllib3
import urllib3.exceptions

GET_MEASUREMENTS_META_QUERY: str = 'SELECT id, variable FROM measurements_meta WHERE project = %s'
GET_MEASUREMENT_EXPORT_QUERY: str = 'SELECT * FROM measurements WHERE variable = ANY(%s)'
MEASUREMENT_TABLE_NAME: str = 'measurements'


class ScriptMode(enum.Enum):
    FULL = 'FULL'
    MEASUREMENT_EXPORT = 'MEASUREMENT_EXPORT'
    MEASUREMENT_IMPORT = 'MEASUREMENT_IMPORT'
    MEASUREMENT_SYNC = 'MEASUREMENT_SYNC'


class ScriptArgumentParser(tap.Tap):
    source_project_id: str
    source_domain: str
    source_realm: str
    source_kubeconfig_filepath: str
    source_db_port: int = 40004
    source_db_user: str
    source_db_pass: str
    source_username: str
    source_password: str
    target_project_id: str | None = None
    target_project_secret: str | None = None
    target_domain: str
    target_realm: str
    target_kubeconfig_filepath: str
    target_db_port: int = 50005
    target_db_user: str
    target_db_pass: str
    target_username: str
    target_password: str
    csv_file_name: str = 'dump.csv'
    import_historic_measurements: bool = True
    script_mode = ScriptMode.FULL


def get_kubeconfig_path_from_prefix(prefix: str) -> str:
    return os.path.join(pathlib.Path.home(), '.kube', f'{prefix}_config')


@contextlib.contextmanager
def forward_database_ports_to_localhost(source_kubeconfig_filepath: str, source_db_port: int,
                                        target_kubeconfig_filepath: str, target_db_port: int) -> None:
    source_process = subprocess.Popen(
        ['kubectl', '--kubeconfig', source_kubeconfig_filepath,
         'port-forward', 'deployment/postgres', f'{source_db_port}:5432', '-n', 'lynus'])
    target_process = subprocess.Popen(
        ['kubectl', '--kubeconfig', target_kubeconfig_filepath,
         'port-forward', 'deployment/postgres', f'{target_db_port}:5432', '-n', 'lynus'])
    time.sleep(5)
    try:
        yield source_process, target_process
    finally:
        source_process.terminate()
        target_process.terminate()
        source_process.wait()
        target_process.wait()


def get_rows_from_connection(
        conn: psycopg.Connection, query: str, arguments: tuple) -> list[dict]:
    with conn.cursor(row_factory=psycopg.rows.dict_row) as cur:
        cur.execute(query, arguments)
        result_rows = cur.fetchall()
        return result_rows


def get_csv_from_query(
        conn: psycopg.Connection, query: str, arguments: tuple, csv_file_name: str) -> None:
    with conn.cursor() as cur:
        with cur.copy(f'COPY ({query}) TO STDOUT WITH CSV HEADER FORCE QUOTE *', arguments) as copy:
            with open(csv_file_name, 'wb') as file:
                while data := copy.read():
                    file.write(data)


def adjust_variable_ids_in_csv(
        csv_file_name: str, source_measurements_meta: dict[str, int],
        target_measurements_meta: dict[str, int],
        measurements_per_chunk: int = 1_048_576) -> None:
    # create the variable id mapping
    variable_id_mapping = {source_measurements_meta[variable_name]: target_measurements_meta[variable_name]
                           for variable_name in source_measurements_meta.keys()}
    # adjust variable ids in dump file
    logging.info('adapting the variable ids in the target historic measurements ...')
    new_csv_file_name = f'new_{csv_file_name}'
    for dump_file_index, dump_file_chunk in enumerate(
            pandas.read_csv(csv_file_name, chunksize=measurements_per_chunk)):
        dump_file_chunk['variable'] = dump_file_chunk['variable'].apply(lambda x: variable_id_mapping[x])
        mode = 'w' if dump_file_index == 0 else 'a'
        header = dump_file_index == 0
        dump_file_chunk.to_csv(new_csv_file_name, index=False, quoting=csv.QUOTE_ALL, header=header, mode=mode)
    os.remove(csv_file_name)
    os.rename(new_csv_file_name, csv_file_name)


def insert_csv_with_connection(conn: psycopg.Connection, table_name: str,
                               csv_file_name: str, block_size: int = 8192,
                               measurements_per_chunk: int = 1_048_576) -> None:
    for dump_file_index, dump_file_chunk in enumerate(pandas.read_csv(csv_file_name, chunksize=measurements_per_chunk)):
        dump_file_chunk_name = f'chunk_{dump_file_index + 1}_{csv_file_name}'
        dump_file_chunk.to_csv(dump_file_chunk_name, index=False, quoting=csv.QUOTE_ALL)
        logging.info(f'starting to upload {dump_file_chunk_name} to the database ...')
        with conn.cursor() as cur:
            with open(dump_file_chunk_name, 'r') as file:
                with cur.copy(f'COPY {table_name} FROM STDIN WITH CSV HEADER') as copy:
                    while data := file.read(block_size):
                        copy.write(data)
            conn.commit()


def get_token(username: str, password: str, domain: str, realm: str):
    response = requests.post(f'https://accounts.{domain}/auth/realms/{realm}/protocol/openid-connect/token',
                             headers={'Content-Type': 'application/x-www-form-urlencoded'},
                             data=f'username={username}&password={password}&grant_type=password&client_id=app',
                             verify=False)
    if not response.ok:
        raise ValueError
    return response.json()['access_token']


def get_api_response(method: str, domain: str, path: str, realm: str,
                     username: str, password: str, data: bytes | None = None, json: object | None = None,
                     headers: tuple[tuple[str, str]] = (), files: dict = None) -> ...:
    response = getattr(requests, method.lower())(
        f'https://api.{domain}/v1{path}',
        headers={'authorization': f'Bearer {get_token(username, password, domain, realm)}',
                 **{k: v for k, v in headers}},
        data=data,
        json=json,
        verify=False,
        files=files)
    if not response.ok:
        raise ValueError
    return response.json()


def object_to_bytes(arg: object) -> bytes:
    return json.dumps(arg).encode('utf-8')


def batch(iterable, n=1):
    l = len(iterable)
    for ndx in range(0, l, n):
        yield iterable[ndx:min(ndx + n, l)]


def publish_values_by_mqtt(
        domain: str, project: str, secret: str, measurement_values: dict[str, float],
        repetitions: int = 2, wait_for_every_single_message: bool = False,
        publish_timeout: float = 5, qos_values: tuple[int, ...] = (0, 1, 2),
        wait_seconds_after_publish: int = 10,
) -> None:
    """the method should now await the publish and also send the message with QOS set to 2"""
    logging.info('creating the variables ...')
    messages = []
    for name, value in measurement_values.items():
        for _ in range(repetitions):
            messages.append((name, value))
    for messages_chunk in batch(messages, 100):
        mqtt_message_infos = []
        client = mqtt.Client()
        client.username_pw_set(project, secret)
        client.connect(f'mqtt.{domain}', 1883)
        client.loop_start()
        for name, value in messages_chunk:
            for qos in qos_values:
                mqtt_message_infos.append(
                    client.publish(f'projects/{project}/messages', f'[{{"n":"{name}","v":{value}}}]', qos=qos))
        if wait_for_every_single_message:
            for mqtt_message_info in mqtt_message_infos:
                if not mqtt_message_info.is_published():
                    mqtt_message_info.wait_for_publish(timeout=publish_timeout)
        time.sleep(wait_seconds_after_publish)
        client.loop_stop()
        client.disconnect()


def map_asset_id(source_domain: str, source_asset_id: str, target_domain: str,
                 target_realm: str, target_username: str, target_password: str, target_project_id: str) -> str:
    asset_bytes = requests.get(f'https://static.{source_domain}/assets/{source_asset_id}', verify=False).content
    response_object = get_api_response('POST', target_domain, f'/projects/{target_project_id}/assets', target_realm,
                                       target_username, target_password,
                                       files={'file': asset_bytes})
    return response_object


def get_source_measurements(source_domain: str, source_project_id: str, source_realm: str, source_username: str,
                            source_password: str, filter_weather_variables: bool = True) -> dict[str, float]:
    # get source variables
    logging.info('getting the source variables ...')
    source_measurements = get_api_response('GET', source_domain, f'/projects/{source_project_id}/measurements',
                                           source_realm, source_username, source_password)
    if filter_weather_variables:
        return {k: v for k, v in source_measurements.items()
                if not k.startswith(f'weather.{source_project_id.replace("-", "_")}.')}
    else:
        return source_measurements


def get_source_variable_ids(source_db_connection: psycopg.Connection, source_project_id: str,
                            source_measurements: dict[str, float]) -> dict[str, int]:
    # get source variable ids
    logging.info(f'getting the source variable ids for project {source_project_id}...')
    source_measurements_meta = {x['variable']: x['id'] for x in get_rows_from_connection(
        source_db_connection, GET_MEASUREMENTS_META_QUERY, (source_project_id,))
                                if x['variable'] in source_measurements}
    return source_measurements_meta


def get_target_variable_ids(target_db_connection: psycopg.Connection, target_project_id: str,
                            source_measurements: dict[str, float]) -> dict[str, int]:
    # get target variable ids
    logging.info('getting the target variable ids ...')
    target_measurements_meta = {x['variable']: x['id'] for x in get_rows_from_connection(
        target_db_connection, GET_MEASUREMENTS_META_QUERY, (target_project_id,))
                                if x['variable'] in source_measurements}
    return target_measurements_meta


def get_db_connection(db_user: str, db_pass: str, db_port: int) -> psycopg.Connection:
    logging.info(f'creating a connection to the database on port {db_port} ...')
    # get db connection
    return psycopg.connect(
        f'postgres://{db_user}:{db_pass}@localhost:{db_port}/lynus?sslmode=disable')


def migrate_project(source_project_id: str, source_domain: str, source_realm: str,
                    source_db_port: int, source_db_user: str, source_db_pass: str,
                    source_username: str, source_password: str, target_domain: str,
                    target_realm: str, target_db_port: int, target_db_user: str,
                    target_db_pass: str, target_username: str, target_password: str,
                    csv_file_name: str, import_historic_measurements: bool) -> None:
    logging.info('creating a connection to the source database ...')
    # get source db connection
    source_db_connection = get_db_connection(source_db_user, source_db_pass, source_db_port)
    logging.info('creating a connection to the target database ...')
    # get target db connection
    target_db_connection = get_db_connection(target_db_user, target_db_pass, target_db_port)
    # get source project
    logging.info('getting the source project ...')
    source_project = get_api_response('GET', source_domain, f'/projects/{source_project_id}', source_realm,
                                      source_username, source_password)
    # get source variables
    source_measurements = get_source_measurements(source_domain, source_project_id, source_realm, source_username,
                                                  source_password)
    # get source variable ids
    source_measurements_meta = get_source_variable_ids(source_db_connection, source_project_id, source_measurements)
    # get source rules
    logging.info('getting the source rules ...')
    source_rules = get_api_response('GET', source_domain, f'/projects/{source_project_id}/rules',
                                    source_realm, source_username, source_password)
    # get source reports
    logging.info('getting the source reports ...')
    source_reports = get_api_response('GET', source_domain, f'/projects/{source_project_id}/reports',
                                      source_realm, source_username, source_password)
    # create the target project id and secret
    logging.info('creating the target project id ...')
    target_project = get_api_response('POST', target_domain, f'/projects', target_realm,
                                      target_username, target_password, data=object_to_bytes(source_project))
    target_project_id = target_project['id']
    target_project_secret = target_project['secret']
    if import_historic_measurements:
        # create database dump file
        logging.info('getting the source historic measurements ...')
        get_csv_from_query(
            source_db_connection,
            GET_MEASUREMENT_EXPORT_QUERY,
            (list(source_measurements_meta.values()),),
            csv_file_name)
    # save the source room positions
    source_room_positions = source_project['meta'].get('roomsPositions', [])
    # transfer eventually present images if present and delete the room positions if present
    logging.info('migrating project images ...')
    if 'imageId' in source_project['meta']:
        source_project['meta']['imageId'] = map_asset_id(source_domain, source_project['meta']['imageId'],
                                                         target_domain, target_realm, target_username, target_password,
                                                         target_project_id)
    if 'reportImageId' in source_project['meta']:
        source_project['meta']['reportImageId'] = map_asset_id(source_domain, source_project['meta']['reportImageId'],
                                                               target_domain, target_realm, target_username,
                                                               target_password, target_project_id)
    source_project['meta'].pop('roomsPositions', None)
    # get source areas
    logging.info('getting the source areas ...')
    source_areas = get_api_response('GET', source_domain, f'/projects/{source_project_id}/collections', source_realm,
                                    source_username, source_password)
    # save the source device positions
    source_device_positions = [x['meta'].get('devicesPositions', []) for x in source_areas]
    # delete the associated images if present and the devicesPositions if present
    for source_room in source_areas:
        if 'cover' in source_room['meta']:
            cover_uri = source_room['meta']['cover']
            if cover_uri.startswith('/assets/'):
                new_asset_id = map_asset_id(source_domain, cover_uri[8:],
                                            target_domain, target_realm, target_username,
                                            target_password, target_project_id)
                source_room['meta']['cover'] = f'/assets/{new_asset_id}'
        source_room['meta'].pop('devicesPositions', None)
    # get source devices
    logging.info('getting the source devices ...')
    source_non_ai_devices = get_api_response('GET', source_domain, f'/projects/{source_project_id}/devices',
                                             source_realm, source_username, source_password)
    # save the source collection ids
    source_collection_ids = [x['collection_id'] for x in source_non_ai_devices]
    # delete the source collection ids if present
    for device in source_non_ai_devices:
        device.pop('collection_id', None)
    # updating the new target project
    logging.info('updating the target project ...')
    target_project = get_api_response('PUT', target_domain, f'/projects/{target_project_id}', target_realm,
                                      target_username, target_password, data=object_to_bytes(source_project))
    # create the target rules
    logging.info('creating the target rules ...')
    _ = [
        get_api_response('POST', target_domain, f'/projects/{target_project_id}/rules', target_realm,
                         target_username, target_password, data=object_to_bytes(x)) for x in source_rules]
    # create the target reports
    logging.info('creating the target reports ...')
    _ = [
        get_api_response('POST', target_domain, f'/projects/{target_project_id}/reports', target_realm,
                         target_username, target_password, data=object_to_bytes(x)) for x in source_reports]
    # create the variables in the project
    publish_values_by_mqtt(target_domain, target_project_id, target_project_secret, source_measurements)
    # create the new areas
    logging.info('creating the target areas ...')
    target_areas = [get_api_response('POST', target_domain, f'/projects/{target_project_id}/collections', target_realm,
                                     target_username, target_password, data=object_to_bytes(x)) for x in source_areas]
    # get target variable ids
    target_measurements_meta = get_target_variable_ids(target_db_connection, target_project_id, source_measurements)
    if import_historic_measurements:
        # adjust variable ids in dump file
        adjust_variable_ids_in_csv(csv_file_name, source_measurements_meta, target_measurements_meta)
    # create the area mapping
    area_mapping = {x['id']: k['id'] for x, k in zip(source_areas, target_areas)}
    # remove deleted areas from source room positions
    source_room_positions = [x for x in source_room_positions if x['i'] in area_mapping]
    # apply area mapping to source room positions
    for mapping in source_room_positions:
        mapping['i'] = area_mapping[mapping['i']]
    # reapply source room positions to the target project object
    target_project['meta']['roomsPositions'] = source_room_positions
    # update project in api
    logging.info('updating the project with new identifiers ...')
    _ = get_api_response('PUT', target_domain, f'/projects/{target_project_id}', target_realm,
                         target_username, target_password, data=object_to_bytes(target_project))
    # apply the correct collection id in the source devices
    for index, collection_id in enumerate(source_collection_ids):
        source_non_ai_devices[index]['collection_id'] = area_mapping[collection_id]
    # create the target devices
    logging.info('creating the target devices ...')
    target_non_ai_devices = [
        get_api_response('POST', target_domain, f'/projects/{target_project_id}/devices', target_realm,
                         target_username, target_password, data=object_to_bytes(x)) for x in source_non_ai_devices]
    # create the device mapping
    device_mapping = {x['id']: k['id'] for x, k in zip(source_non_ai_devices, target_non_ai_devices)}
    # remove already deleted devices from source device positions
    for index, _ in enumerate(source_device_positions):
        source_device_positions[index] = [x for x in source_device_positions[index] if x['i'] in device_mapping]
    # apply device mapping to source device positions
    for area_positions in source_device_positions:
        for device_position in area_positions:
            device_position['i'] = device_mapping[device_position['i']]
    # reapply source device positions to the target areas
    for target_area, target_device_position in zip(target_areas, source_device_positions):
        target_area['meta']['devicesPositions'] = target_device_position
    # update the areas in the api
    logging.info('updating the target areas with new identifiers ...')
    for target_area in target_areas:
        get_api_response('PUT', target_domain, f'/projects/{target_project_id}/collections/{target_area["id"]}',
                         target_realm, target_username, target_password, data=object_to_bytes(target_area))
    # put the dumped measurements in the new database
    if import_historic_measurements:
        logging.info('storing the target historic measurements ...')
        insert_csv_with_connection(target_db_connection, MEASUREMENT_TABLE_NAME, csv_file_name)
    # syncing all project documents
    logging.info('syncing the project documents ...')
    source_documents = get_api_response('GET', source_domain, f'/projects/{source_project_id}/documents',
                                        source_realm, source_username, source_password)
    for source_document in source_documents:
        source_document_bytes = requests.get(source_document['href']).content
        upload_data = get_api_response(
            'POST', target_domain, f'/projects/{target_project_id}/documents',
            target_realm, target_username, target_password, data=object_to_bytes({
                'name': source_document['name'], 'content_type': source_document['content_type'],
                'size': source_document['size']}))
        requests.post(upload_data['upload_url'], data=upload_data['form'], files={'file': source_document_bytes})
    # applying the same weather settings as the source project
    logging.info('syncing the project weather settings ...')
    weather_enabled = get_api_response('GET', source_domain, f'/projects/{source_project_id}/weather',
                                       source_realm, source_username, source_password)['site_active']
    if weather_enabled:
        target_project_location = target_project['meta']['location']
        get_api_response(
            'POST', target_domain, f'/projects/{target_project_id}/weather',
            target_realm, target_username, target_password, json={
                'latitude': float(target_project_location['lat']), 'longitude': float(target_project_location['lon'])})
    # finish the migration
    logging.info(f'finished the migration process to the new project with id {target_project_id}!')


def measurement_export(args: ScriptArgumentParser) -> None:
    logging.info('creating a connection to the source database ...')
    # get source db connection
    source_db_connection = get_db_connection(args.source_db_user, args.source_db_pass, args.source_db_port)
    logging.info('creating a connection to the target database ...')
    # get target db connection
    target_db_connection = get_db_connection(args.target_db_user, args.target_db_pass, args.target_db_port)
    # get source variables
    source_measurements = get_source_measurements(args.source_domain, args.source_project_id, args.source_realm,
                                                  args.source_username,
                                                  args.source_password)
    # create the variables in the target project
    publish_values_by_mqtt(args.target_domain, args.target_project_id, args.target_project_secret, source_measurements)
    # get source variable ids
    source_measurements_meta = get_source_variable_ids(source_db_connection, args.source_project_id,
                                                       source_measurements)
    # get target variable ids
    target_measurements_meta = get_target_variable_ids(target_db_connection, args.target_project_id,
                                                       source_measurements)
    # create database dump file
    logging.info('getting the source historic measurements ...')
    get_csv_from_query(
        source_db_connection,
        GET_MEASUREMENT_EXPORT_QUERY,
        (list(source_measurements_meta.values()),),
        args.csv_file_name)
    # adjust variable ids in dump file
    adjust_variable_ids_in_csv(args.csv_file_name, source_measurements_meta, target_measurements_meta)


def measurement_import(args: ScriptArgumentParser) -> None:
    logging.info('creating a connection to the target database ...')
    # get target db connection
    target_db_connection = get_db_connection(args.target_db_user, args.target_db_pass, args.target_db_port)
    logging.info('storing the target historic measurements ...')
    insert_csv_with_connection(target_db_connection, MEASUREMENT_TABLE_NAME, args.csv_file_name)


def check_export_and_import_arguments(args: ScriptArgumentParser) -> None:
    if args.import_historic_measurements is False \
            or args.target_project_id is None \
            or args.target_project_secret is None:
        raise ValueError


def main() -> None:
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    logging.basicConfig(
        format='%(asctime)s %(levelname)-8s %(message)s',
        level=logging.INFO,
        datefmt='%Y-%m-%d %H:%M:%S')
    args = ScriptArgumentParser().parse_args()
    with forward_database_ports_to_localhost(args.source_kubeconfig_filepath, args.source_db_port,
                                             args.target_kubeconfig_filepath, args.target_db_port):
        match args.script_mode:
            case ScriptMode.FULL.value:
                migrate_project(args.source_project_id, args.source_domain, args.source_realm,
                                args.source_db_port, args.source_db_user, args.source_db_pass,
                                args.source_username, args.source_password, args.target_domain,
                                args.target_realm, args.target_db_port, args.target_db_user,
                                args.target_db_pass, args.target_username, args.target_password,
                                args.csv_file_name, args.import_historic_measurements)
            case ScriptMode.MEASUREMENT_EXPORT.value:
                check_export_and_import_arguments(args)
                measurement_export(args)
            case ScriptMode.MEASUREMENT_IMPORT.value:
                check_export_and_import_arguments(args)
                measurement_import(args)
            case ScriptMode.MEASUREMENT_SYNC.value:
                check_export_and_import_arguments(args)
                measurement_export(args)
                measurement_import(args)


if __name__ == '__main__':
    main()
