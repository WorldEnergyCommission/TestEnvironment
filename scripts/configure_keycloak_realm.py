import argparse
import contextlib
import json
import logging
import os.path
import pathlib
import subprocess
import time

from constants import get_clusters
from deploy_and_restart import set_k8s_context

KEYCLOAK_FOLDER_NAME = 'keycloak-21.1.1'
KEYCLOAK_VERSION = '21.1.1'
KEYCLOAK_ABBREVIATION = 'kc'
KEYSTORE_PASSWORD = '12345678'
KEYSTORE_ADMIN_EXECUTABLE = 'kcadm.sh'
CERTIFICATE_FILE_NAME = 'certificate.crt'
APP_URI = 'http://localhost'
DASHBOARD_DEV_URI = 'http://localhost:4200'
CONSOLE_DEV_URI = 'http://localhost:8080'
REALM_NAME_POSTFIX = '_REALM_NAME'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--cluster', type=str, required=True)
    parser.add_argument('--add_host_to_keystore', action='store_true')
    parser.add_argument('--no-add_host_to_keystore', dest='add_host_to_keystore', action='store_false')
    parser.set_defaults(add_host_to_keystore=True)
    return parser.parse_args()


def download_keycloak_and_return_admin_executable_path() -> str:
    extract_folder = pathlib.Path.home()
    subprocess.run([
        f'wget https://github.com/keycloak/keycloak/releases/download/{KEYCLOAK_VERSION}/{KEYCLOAK_FOLDER_NAME}.zip'],
        shell=True, check=True)
    subprocess.run([f'unzip -o {KEYCLOAK_FOLDER_NAME}.zip -d {extract_folder}'], shell=True, check=True)
    return os.path.join(extract_folder, KEYCLOAK_FOLDER_NAME, 'bin', KEYSTORE_ADMIN_EXECUTABLE)


def create_keystore(domain: str) -> None:
    subprocess.run([f'echo -n | openssl s_client -connect '
                    f'{get_keycloak_hostname(domain)}:443 | openssl x509 > {CERTIFICATE_FILE_NAME}'],
                   shell=True, check=True)
    subprocess.run([f'keytool -import -file {CERTIFICATE_FILE_NAME} -alias {KEYCLOAK_ABBREVIATION} '
                    f'-keystore {KEYCLOAK_ABBREVIATION} -storepass {KEYSTORE_PASSWORD} -noprompt'],
                   shell=True, check=True)


def get_keycloak_hostname(domain: str) -> str:
    return f'accounts.{domain}'


def get_api_url(domain: str) -> str:
    return f'https://api.{domain}'


def get_dashboard_url(domain: str) -> str:
    return f'https://dashboard.{domain}'


def log_into_keycloak(admin_executable_path: str, domain: str,
                      keycloak_admin_name: str, keycloak_admin_password: str, use_keystore: bool) -> None:
    if use_keystore:
        subprocess.run(
            [f'{admin_executable_path} config truststore --trustpass {KEYSTORE_PASSWORD} {KEYCLOAK_ABBREVIATION}'],
            shell=True, check=True)
    if use_keystore:
        host = f'https://{get_keycloak_hostname(domain)}'
    else:
        host = f'http://localhost:8080'
    subprocess.run([f'{admin_executable_path} config credentials --server '
                    f'"{host}/auth" --realm master '
                    f'--user {keycloak_admin_name} --password {keycloak_admin_password}'],
                   shell=True, check=True)


def does_realm_exist(admin_executable_path: str, realm_name: str) -> bool:
    realm_objects = json.loads(
        subprocess.run([f'{admin_executable_path} get realms --fields "realm"'], shell=True, check=True,
                       capture_output=True).stdout.decode('utf-8'))
    return realm_name in [x['realm'] for x in realm_objects]


def get_client_mapping(admin_executable_path: str, realm_name: str) -> dict:
    client_mapping = {}
    clients = json.loads(subprocess.run([f'{admin_executable_path} get clients -r {realm_name} --fields "id,clientId"'],
                                        shell=True, check=True, capture_output=True).stdout.decode('utf-8'))
    for client in clients:
        client_mapping[client['clientId']] = client['id']
    return client_mapping


def does_client_exist(admin_executable_path: str, realm_name: str, client_id: str) -> bool:
    client_mapping = get_client_mapping(admin_executable_path, realm_name)
    return client_id in client_mapping


def create_realm(admin_executable_path: str, realm_name: str) -> None:
    subprocess.run([f'{admin_executable_path} create realms -s realm={realm_name} -s enabled=true'],
                   shell=True, check=True)


def update_realm_setting(admin_executable_path: str, realm_name: str, key: str, value: str) -> None:
    subprocess.run([f'{admin_executable_path} update realms/{realm_name} -s \'{key}={value}\''],
                   shell=True, check=True)


def create_client(admin_executable_path: str, realm_name: str, client_id: str) -> None:
    subprocess.run([f'{admin_executable_path} create clients -r {realm_name} -s clientId={client_id} -s enabled=true'],
                   shell=True, check=True)


def update_client_settings(admin_executable_path: str, realm_name: str, client_id: str,
                           redirect_uri: str, web_origin: str) -> None:
    subprocess.run([f'{admin_executable_path} update '
                    f'clients/{get_id_for_client_id(admin_executable_path, realm_name, client_id)} '
                    f'-r {realm_name} -s \'redirectUris=["{redirect_uri}"]\' -s \'webOrigins=["{web_origin}"]\' '
                    f'-s \'publicClient=true\' -s \'directAccessGrantsEnabled=true\''],
                   shell=True, check=True)


def get_id_for_client_id(admin_executable_path: str, realm_name: str, client_id: str) -> str:
    return get_client_mapping(admin_executable_path, realm_name)[client_id]


def get_realm_configs_from_the_environment() -> list[tuple[str, str, str, str, str, str, str]]:
    realms = []
    for key, value in os.environ.items():
        if key.endswith(REALM_NAME_POSTFIX):
            realms.append(value)
    realm_configs = []
    for realm in realms:
        realm_configs.append(
            (os.environ[f'{realm.upper()}{REALM_NAME_POSTFIX}'], os.environ[f'{realm.upper()}_REGISTRATION_ALLOWED'],
             os.environ[f'{realm.upper()}_CONSOLE_URI'], os.environ[f'{realm.upper()}_SENDGRID_FROM_MAIL'],
             os.environ[f'{realm.upper()}_SENDGRID_MAIL_NAME'], os.environ[f'{realm.upper()}_KEYCLOAK_SENDGRID_KEY'],
             os.environ[f'{realm.upper()}_MAIL_AS_USERNAME']))
    return realm_configs


@contextlib.contextmanager
def forward_keycloak_port_to_localhost():
    process = subprocess.Popen(["kubectl", "port-forward", "deployment/keycloak", "8080:8080", "-n", "lynus"])
    time.sleep(10)
    try:
        yield process
    finally:
        process.terminate()
        process.wait()


def set_up_keycloak_realm(cluster: str, add_host_to_keystore: bool) -> None:
    set_k8s_context(cluster)
    logging.info(f'cluster: {cluster}')

    domain = os.getenv(f'{cluster.upper()}_DOMAIN')
    keycloak_admin_name = os.getenv(f'{cluster.upper()}_KEYCLOAK_USERNAME')
    keycloak_admin_password = os.getenv(f'{cluster.upper()}_KEYCLOAK_PASSWORD')
    logging.info(f'domain: {domain}')
    logging.info(f'keycloak_admin_name: {keycloak_admin_name}')
    logging.info(f'keycloak_admin_password: {keycloak_admin_password}')

    admin_executable_path = download_keycloak_and_return_admin_executable_path()
    logging.info(f'admin_executable_path: {admin_executable_path}')
    logging.info(f'add_host_to_keystore: {add_host_to_keystore}')

    if add_host_to_keystore:
        create_keystore(domain)
    with forward_keycloak_port_to_localhost():
        log_into_keycloak(admin_executable_path, domain, keycloak_admin_name, keycloak_admin_password,
                          add_host_to_keystore)
        for (realm_name, registration_allowed, console_uri, sendgrid_from_mail, sendgrid_mail_name, sendgrid_key,
             mail_as_username) in get_realm_configs_from_the_environment():
            logging.info(f'realm_name: {realm_name}')
            logging.info(f'registration_allowed: {registration_allowed}')
            logging.info(f'console_uri: {console_uri}')
            logging.info(f'sendgrid_from_mail: {sendgrid_from_mail}')
            logging.info(f'sendgrid_mail_name: {sendgrid_mail_name}')
            logging.info(f'sendgrid_key: {sendgrid_key}')
            logging.info(f'mail_as_username: {mail_as_username}')
            if not does_realm_exist(admin_executable_path, realm_name):
                create_realm(admin_executable_path, realm_name)
            for key, value in (
                    ('loginTheme', realm_name), ('accountTheme', realm_name), ('internationalizationEnabled', 'true'),
                    ('supportedLocales', '["de","en"]'), ('defaultLocale', 'de'),
                    ('registrationAllowed', registration_allowed),
                    ('registrationEmailAsUsername', mail_as_username), ('rememberMe', 'true'),
                    ('resetPasswordAllowed', 'true'),
                    ('verifyEmail', 'true'), ('eventsEnabled', 'true'), ('eventsExpiration', '604800'),
                    ('adminEventsEnabled', 'true'),
                    ('smtpServer',
                     f'{{"starttls":"true","auth":"true","password":"{sendgrid_key}","port":"587",'
                     f'"host":"smtp.sendgrid.net","from":"{sendgrid_from_mail}",'
                     f'"fromDisplayName":"{sendgrid_mail_name}","user":"apikey"}}'),
                    ('ssoSessionMaxLifespan', '2592000'), ('ssoSessionIdleTimeout', '2592000')):
                update_realm_setting(admin_executable_path, realm_name, key, value)
            for client_id, redirect_uri, web_origin in (
                    ('console', f'{console_uri}/*', console_uri),
                    ('console-dev', f'{CONSOLE_DEV_URI}/*', CONSOLE_DEV_URI),
                    ('dashboard', f'{get_dashboard_url(domain)}/*', get_dashboard_url(domain)),
                    ('dashboard-dev', f'{DASHBOARD_DEV_URI}/*', DASHBOARD_DEV_URI),
                    ('app', f'{APP_URI}/*', APP_URI),
                    ('openapi', f'{get_api_url(domain)}/v1/swagger/*', get_api_url(domain))):
                if not does_client_exist(admin_executable_path, realm_name, client_id):
                    create_client(admin_executable_path, realm_name, client_id)
                update_client_settings(admin_executable_path, realm_name, client_id, redirect_uri, web_origin)


def main() -> None:
    logging.getLogger().setLevel(logging.INFO)
    args = parse_args()
    clusters = get_clusters(args.cluster)
    for cluster in clusters:
        set_up_keycloak_realm(cluster, args.add_host_to_keystore)


if __name__ == '__main__':
    main()
