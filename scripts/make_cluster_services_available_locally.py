import atexit
import logging
import os
import pathlib
import subprocess
import time

# install with pip3 install typed-argument-parser
import tap

ServiceConfig = tuple[str, str, int, int, str]
SERVICE_CONFIGS: set[ServiceConfig] = {('deployment', 'postgres', 5432, 5432, 'lynus'),
                                       ('deployment', 'mosquitto', 1883, 1883, 'lynus'),
                                       ('deployment', 'redis', 6379, 6379, 'lynus'),
                                       ('deployment', 'empa', 9000, 8000, 'lynus'),
                                       ('deployment', 'longhorn-ui', 7000, 8000, 'longhorn-system')}


class ScriptArgumentParser(tap.Tap):
    directory: str = os.path.join(pathlib.Path.home(), '.kube')
    filename: str = 'config'
    prefix: str = ''


def get_forward_service_process(kubeconfig_path: str, resource_type: str, resource_name: str,
                                local_port: int, remote_port: int, namespace: str) -> subprocess.Popen:
    return subprocess.Popen(['kubectl', '--kubeconfig', kubeconfig_path, 'port-forward',
                             f'{resource_type}/{resource_name}', f'{local_port}:{remote_port}', '-n', namespace])


def manage_process_dict(kubeconfig_path: str, process_dict: dict[ServiceConfig, subprocess.Popen],
                        refresh_interval_seconds: int = 1) -> None:
    while True:
        for service_config in SERVICE_CONFIGS:
            if service_config not in process_dict or process_dict[service_config].poll() is not None:
                process_dict[service_config] = get_forward_service_process(kubeconfig_path, *service_config)
        time.sleep(refresh_interval_seconds)


def kill_processes(process_dict: dict[ServiceConfig, subprocess.Popen]) -> None:
    for process in process_dict.values():
        process.kill()


def main() -> None:
    logging.getLogger().setLevel(logging.INFO)
    args = ScriptArgumentParser().parse_args()
    process_dict = {}
    atexit.register(kill_processes, process_dict)
    if args.prefix:
        config_filename = f'{args.prefix}_{args.filename}'
    else:
        config_filename = args.filename
    manage_process_dict(os.path.join(args.directory, config_filename), process_dict)


if __name__ == '__main__':
    main()
