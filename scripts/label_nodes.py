import argparse
import subprocess

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
    return parser.parse_args()


def get_nodetype_for_node(node: str) -> str:
    labels_string = 'Labels:'
    annotations_string = 'Annotations:'
    node_describe_process = subprocess.run([f'kubectl describe node {node}'],
                                           shell=True, check=True, capture_output=True)
    output_string = node_describe_process.stdout.decode('utf-8')
    labels_start = output_string.index(labels_string)
    annotations_start = output_string.index(annotations_string)
    labels = set(output_string[labels_start +
                 len(labels_string):annotations_start].strip().split())
    if 'node.kubernetes.io/instance-type=large' in labels or 'node.kubernetes.io/instance-type=standard.large' in labels:
        return 'large'
    elif 'node.kubernetes.io/instance-type=extra-large' in labels or 'node.kubernetes.io/instance-type=standard.extra-large' in labels or 'node.kubernetes.io/instance-type=cpu.extra-large' in labels:
        return 'huge'
    elif 'node.kubernetes.io/instance-type=huge' in labels or 'node.kubernetes.io/instance-type=standard.huge' in labels:
        return 'huge'
    elif 'node.kubernetes.io/instance-type=cpu.huge' in labels or 'node.kubernetes.io/instance-type=cpu.huge' in labels:
        return 'huge-cpu'
    else:
        raise ValueError


def label_nodes(cluster: str) -> None:
    set_k8s_context(cluster)
    node_list_process = subprocess.run(
        ['kubectl get nodes'], shell=True, check=True, capture_output=True)
    nodes = [x.split()[0] for x in node_list_process.stdout.decode(
        'utf-8').strip().split('\n')[1:]]
    for node in nodes:
        subprocess.run([f'kubectl label nodes {node} nodetype={get_nodetype_for_node(node)}'],
                       shell=True, check=True)


def main() -> None:
    args = parse_args()
    clusters = get_clusters(args.cluster)
    for cluster in clusters:
        label_nodes(cluster)


if __name__ == '__main__':
    main()
