import argparse
import base64
import random
import string

from pykeepass import pykeepass

CLUSTER_ENTRY_CONFIG: list[str] = ['ADMIN_CONSOLE_PASSWORD',
                                   'EMPA_PASSWORD',
                                   'GRAFANA_ADMIN_PASSWORD',
                                   'KEYCLOAK_PASSWORD',
                                   'KEYCLOAK_USERNAME',
                                   'MINIO_PASSWORD',
                                   'MINIO_USERNAME',
                                   'POSTGRES_PASSWORD',
                                   'POSTGRES_USERNAME',
                                   'GPS_TOKEN']


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--keepass_file_path', type=str, required=True)
    parser.add_argument('--keepass_master_password', type=str, required=True)
    parser.add_argument('--cluster', type=str, required=True)
    return parser.parse_args()


def generate_random_password(length: int) -> str:
    allowed_characters = list(string.ascii_letters) + list(string.digits)
    return ''.join([random.choice(allowed_characters) for x in range(length)])


def base64_encode_string(input_string: str) -> str:
    return base64.b64encode(input_string.encode('utf-8')).decode('utf-8')


def generate_credentials(keepass_file_path: str, keepass_master_password: str, cluster: str) -> None:
    keepass_database = pykeepass.PyKeePass(keepass_file_path, password=keepass_master_password)
    cluster_env_group = keepass_database.find_groups(
        recursive=False, path=['cloud', f'{cluster}Cluster', 'environment'])
    for title_part in CLUSTER_ENTRY_CONFIG:
        entry_title = f'{cluster.upper()}_{title_part}_BASE64'
        present_entries = [x for x in cluster_env_group.entries if x.title == entry_title]
        for present_entry in present_entries:
            present_entry.delete()
        keepass_database.add_entry(destination_group=cluster_env_group,
                                   title=entry_title,
                                   username='',
                                   password=base64_encode_string(generate_random_password(32)),
                                   icon=cluster_env_group.icon)
    keepass_database.save()


def main() -> None:
    args = parse_args()
    generate_credentials(args.keepass_file_path, args.keepass_master_password, args.cluster)


if __name__ == '__main__':
    main()
