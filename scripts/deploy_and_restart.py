import argparse
import base64
import hashlib
import hmac
import logging
import os
import subprocess
import time
import typing
from pathlib import Path
from urllib.parse import quote, urlencode

import requests

from constants import get_clusters
from replace_in_file_from_environment import replace_in_file_from_environment
from exoscale_auth_v2 import ExoscaleV2Auth


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--cluster', type=str, required=True)
    parser.add_argument('--deployment_file', type=str, required=True)
    parser.add_argument('--replace_tag', action='store_true')
    parser.add_argument('--no-replace_tag',
                        dest='replace_tag', action='store_false')
    parser.set_defaults(replace_tag=True)
    parser.add_argument('--replace_instancepool_id', action='store_true')
    parser.add_argument('--no-replace_instancepool_id',
                        dest='replace_instancepool_id', action='store_false')
    parser.set_defaults(replace_instancepool_id=False)
    parser.add_argument('--sha', type=str, required=True)
    parser.add_argument('--resource_name', type=str, default='')
    parser.add_argument('--resource_type', type=str, default='deployment')
    parser.add_argument('--namespace_name', type=str, required=True)
    parser.add_argument('--restart_mode', type=str, required=True)
    parser.add_argument('--apply_only_on_changes', action='store_true')
    parser.add_argument('--no-apply_only_on_changes',
                        dest='apply_only_on_changes', action='store_false')
    parser.set_defaults(apply_only_on_changes=True)
    parser.add_argument('--wait_seconds', type=int, default=10)
    parser.add_argument('--replace_resources_big_services',
                        action="store_true")
    parser.add_argument('--no-replace_resources_big_services', dest='replace_resources_big_services',
                        action='store_false')
    parser.set_defaults(replace_resources_big_services=False)
    parser.add_argument('--replace_domain',
                        action="store_true")
    parser.add_argument('--no-replace_domain', dest='replace_domain',
                        action='store_false')
    parser.set_defaults(replace_domain=False)
    return parser.parse_args()


def set_k8s_context(cluster: str) -> None:
    kubeconfig_dir = os.path.join(Path.home(), '.kube')
    os.makedirs(kubeconfig_dir, exist_ok=True)
    with open(os.path.join(kubeconfig_dir, 'config'), 'w') as file:
        file.write(os.getenv(f'{cluster.upper()}_KUBECONFIG'))


def sign(command, secret):
    arguments = sorted(command.items())
    query_string = '&'.join('='.join((key, quote(value, safe='*')))
                            for key, value in arguments)
    digest = hmac.new(
        secret.encode('utf-8'),
        msg=query_string.lower().encode('utf-8'),
        digestmod=hashlib.sha1).digest()
    signature = base64.b64encode(digest).decode('utf-8')
    return dict(command, signature=signature)


def get_value_from_env(cluster: str, key_ends_with: str) -> str:
    env_val = None
    for key, value in os.environ.items():
        if key == f'{cluster.upper()}_{key_ends_with}':
            env_val = value
    if env_val is None:
        raise ValueError
    return env_val


def get_instance_pool_id_for_load_balancer(cluster: str) -> str:
    api_key = get_value_from_env(cluster, 'EXOSCALE_API_KEY')
    api_secret = get_value_from_env(cluster, 'EXOSCALE_SECRET_KEY')
    instance_pools = []
    available_zone_ids = (
        'ch-gva-2',
        # 'ch-dk-2',
        # 'de-fra-1',
        # 'de-muc-1',
        'at-vie-1',
        # 'at-vie-2',
        # 'bg-sof-1'
    )

    for zone_id in available_zone_ids:
        auth = ExoscaleV2Auth(api_key, api_secret)

        response = requests.get(f"https://api-{zone_id}.exoscale.com/v2/instance-pool", auth=auth)
        if not response.ok:
            if response.status_code == 403:
                continue
            else:
                logging.info(response)
                raise RuntimeError

        response_object = response.json()['instance-pools']
        if len(response_object) != 0:
            instance_pools.extend(response_object)

    if len(instance_pools) == 0:
        raise ValueError
    sorted_instance_pool_ids = sorted(instance_pools, key=lambda x: x['size'])
    biggest_instance_pool_id = sorted_instance_pool_ids[-1]
    return biggest_instance_pool_id['id']


def replace_in_file(file_path: str, search_string: str, replace_string: str) -> None:
    with open(file_path) as file:
        content = file.read()
    modified_content = content.replace(search_string, replace_string)
    with open(file_path, 'w') as file:
        file.write(modified_content)


def apply_deployment_file(deployment_file: str) -> None:
    try:
        subprocess.run([f'kubectl apply -f {deployment_file}'], shell=True, check=True)
    except subprocess.CalledProcessError as e:
        if e.stdout is not None:
            logging.info(e.stdout.decode('utf-8').strip())
        if e.stderr is not None:
            logging.info(e.stderr.decode('utf-8').strip())
        raise e


def delete_deployment_file(deployment_file: str) -> None:
    """Delete a deployment using its deployment file

    :param deployment_file: file name with path
    :type deployment_file: str
    """
    print(f"WARNING DELETING DEPLOYMENT: {deployment_file}")
    subprocess.run(
        [f'kubectl delete --ignore-not-found=true  -f {deployment_file}'], shell=True, check=True)


def get_output_object_from_error(error: subprocess.CalledProcessError) -> str:
    return str({'stdout': error.stdout.decode('utf-8').strip(), 'stderr': error.stderr.decode('utf-8').strip()})


def get_current_replicas(resource_name: str, namespace_name: str, resource_type: str) -> typing.Union[int, None]:
    try:
        process_output = subprocess.run([f'kubectl get {resource_type} {resource_name}'
                                         f' -n {namespace_name} -o jsonpath="{{.spec.replicas}}"'],
                                        shell=True, check=True, capture_output=True).stdout.decode('utf-8').strip()
        return int(process_output)
    except subprocess.CalledProcessError as e:
        if 'NotFound' in e.stderr.decode('utf-8').strip():
            return None
        else:
            logging.info(get_output_object_from_error(e))
            raise e


def is_deployment_file_changed(deployment_file: str) -> bool:
    process = subprocess.run(
        [f'kubectl diff -f {deployment_file}'], shell=True, capture_output=True)
    stdout = process.stdout.decode('utf-8').strip()
    stderr = process.stderr.decode('utf-8').strip()
    if len(stdout) > 0 or 'NotFound' in stderr:
        return True
    elif process.returncode == 0:
        return False
    else:
        logging.info(stdout, stderr)
        raise ValueError


def fill_in_values_from_env(deployment_file: str, cluster: str) -> None:
    if deployment_file == 'infrastructure/deployment/longhorn/backup/deployment.yaml':
        replace_in_file_from_environment(
            'infrastructure/deployment/longhorn/backup/deployment.yaml', cluster, True)
    elif deployment_file == 'infrastructure/deployment/secrets/deployment.yaml':
        replace_in_file_from_environment(
            'infrastructure/deployment/secrets/deployment.yaml', cluster, False)


def deploy_and_restart(cluster: str, deployment_file: str, replace_tag: bool, sha: str, resource_name: str,
                       resource_type: str,
                       namespace_name: str, restart_mode: str, apply_only_on_changes: bool,
                       wait_seconds: int, replace_instancepool_id: bool, replace_resources_big_services: bool, replace_domain=False) -> None:
    set_k8s_context(cluster)
    fill_in_values_from_env(deployment_file, cluster)
    if replace_tag:
        replace_in_file(deployment_file, 'TAG', sha)
    if replace_instancepool_id:
        replace_in_file(deployment_file, 'INSTANCEPOOL_ID',
                        get_instance_pool_id_for_load_balancer(cluster))
    if replace_resources_big_services:
        replace_in_file(deployment_file, 'MINIMUM_RAM_BIG_SERVICES',
                        get_value_from_env(cluster, 'MINIMUM_RAM_BIG_SERVICES'))
        replace_in_file(deployment_file, 'MINIMUM_CPU_BIG_SERVICES',
                        get_value_from_env(cluster, 'MINIMUM_CPU_BIG_SERVICES'))
        replace_in_file(deployment_file, 'MAXIMUM_RAM_BIG_SERVICES',
                        get_value_from_env(cluster, 'MAXIMUM_RAM_BIG_SERVICES'))
        replace_in_file(deployment_file, 'MAXIMUM_CPU_BIG_SERVICES',
                        get_value_from_env(cluster, 'MAXIMUM_CPU_BIG_SERVICES'))
        replace_in_file(deployment_file, 'MAXIMUM_RAM_POSTGRES',
                        get_value_from_env(cluster, 'MAXIMUM_RAM_POSTGRES'))
        replace_in_file(deployment_file, 'MAXIMUM_CPU_POSTGRES',
                        get_value_from_env(cluster, 'MAXIMUM_CPU_POSTGRES'))
        replace_in_file(deployment_file, 'POSTGRES_CONFIG_BIG_SERVICES',
                        get_value_from_env(cluster, 'POSTGRES_CONFIG_BIG_SERVICES'))
    if replace_domain:
        replace_in_file(deployment_file, '$DOMAIN',
                        get_value_from_env(cluster, 'DOMAIN'))
    #if not is_deployment_file_changed(deployment_file) and apply_only_on_changes and restart_mode != 'delete':
    #    return

    if restart_mode == 'full':
        if resource_type == 'daemonset':
            raise ValueError
        current_replica_amount = get_current_replicas(
            resource_name, namespace_name, resource_type)
        if current_replica_amount is not None:
            subprocess.run([f'kubectl scale --replicas=0 {resource_type} {resource_name} -n {namespace_name}'],
                           shell=True, check=True)
            time.sleep(wait_seconds)
        apply_deployment_file(deployment_file)
        if current_replica_amount is not None:
            subprocess.run(
                [f'kubectl scale --replicas={current_replica_amount}'
                 f' {resource_type} {resource_name} -n {namespace_name}'], shell=True, check=True)
    elif restart_mode == 'rolling':
        apply_deployment_file(deployment_file)
        time.sleep(wait_seconds)
        subprocess.run([f'kubectl rollout restart {resource_type} {resource_name} -n {namespace_name}'],
                       shell=True, check=True)
    elif restart_mode == 'no':
        apply_deployment_file(deployment_file)
    elif restart_mode == 'server-side':
        subprocess.run([f'kubectl apply --server-side -f  {deployment_file}'],
                       shell=True, check=True)
    elif restart_mode == 'delete':
        delete_deployment_file(deployment_file)
    else:
        raise ValueError


def main() -> None:
    logging.getLogger().setLevel(logging.INFO)
    args = parse_args()
    clusters = get_clusters(args.cluster)
    for cluster in clusters:
        # save the deployment file state
        with open(args.deployment_file) as file:
            deployment_file_copy = file.read()
        # executes the deploy that makes replacements to the file
        deploy_and_restart(
            cluster, args.deployment_file, args.replace_tag, args.sha, args.resource_name, args.resource_type,
            args.namespace_name, args.restart_mode, args.apply_only_on_changes, args.wait_seconds,
            args.replace_instancepool_id, args.replace_resources_big_services, args.replace_domain)
        # restore the initial state of the file
        with open(args.deployment_file, 'w') as file:
            file.write(deployment_file_copy)


if __name__ == '__main__':
    main()
