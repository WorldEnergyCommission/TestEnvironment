import argparse
import base64
import logging
import os

BASE64_POSTFIX = '_BASE64'
VALUE_POSTFIX = '_VALUE'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--file_path', type=str, required=True)
    parser.add_argument('--cluster', type=str, required=True)
    parser.add_argument('--apply_decoded', action='store_true')
    parser.add_argument('--no-apply_decoded',
                        dest='apply_decoded', action='store_false')
    parser.set_defaults(apply_decoded=False)
    return parser.parse_args()


def decode_base64_string(input_string: str) -> str:
    return base64.b64decode(input_string.encode('utf-8')).decode('utf-8')


def replace_in_file_if_present(content: str, cluster: str, key: str, value: str, apply_decoded: bool) -> str:
    if not key.endswith(BASE64_POSTFIX):
        return content
    modified_key = key.replace(BASE64_POSTFIX, VALUE_POSTFIX)
    cluster_prefix = f'{cluster.upper()}_'
    if modified_key.startswith(cluster_prefix):
        modified_key = modified_key.replace(cluster_prefix, '')
    if modified_key in content:
        if apply_decoded:
            value = decode_base64_string(value)
        content = content.replace(modified_key, value)
    return content


def replace_in_file_from_environment(file_path: str, cluster: str, apply_decoded: bool) -> None:
    with open(file_path) as file:
        content = file.read()
    for key, value in os.environ.items():
        content = replace_in_file_if_present(
            content, cluster, key, value, apply_decoded)
    with open(file_path, 'w') as file:
        logging.info(content)
        file.write(content)


def replace_in_file_from_keepass(
        file_path: str, cluster: str, apply_decoded: bool,
        keepass_file_path: str, keepass_master_password: str) -> None:
    import pykeepass
    with open(file_path) as file:
        content = file.read()
    keepass_database = pykeepass.PyKeePass(
        keepass_file_path, password=keepass_master_password)
    cluster_env_group = keepass_database.find_groups(
        recursive=False, path=['cloud', f'{cluster}Cluster', 'environment'])
    for key, value in [(x.title, x.password) for x in cluster_env_group.entries]:
        content = replace_in_file_if_present(
            content, cluster, key, value, apply_decoded)
    with open(file_path, 'w') as file:
        file.write(content)


def main() -> None:
    args = parse_args()
    replace_in_file_from_environment(
        args.file_path, args.cluster, args.apply_decoded)


if __name__ == '__main__':
    main()
