import argparse
import logging
import os
import pathlib
import sys
import time

import requests

from constants import get_clusters

OWNER = 'eneries'
REPO = 'eneries'
NON_CLUSTER_WORKFLOW_FILES = {
    'android_app_ci_cd.yaml', 'ios_app_ci_cd.yaml', 'github_secrets_ci_cd.yaml'}
OWN_WORKFLOW_FILE = 'cluster_ci_cd.yaml'
CLUSTER_CONFIG = ((('terraform_ci_cd.yaml',), 120),
                  (('longhorn_ci_cd.yaml', 'namespace_ci_cd.yaml', 'label_ci_cd.yaml'), 600),
                  (('secrets_ci_cd.yaml', 'promtail_ci_cd.yaml', 'node_exporter_ci_cd.yaml',
                    'mosquitto_ci_cd.yaml'), 120),
                  (('postgres_ci_cd.yaml', 'redis_ci_cd.yaml',
                    'prometheus_ci_cd.yaml', 'minio_ci_cd.yaml', 'loki_ci_cd.yaml', 'grafana_ci_cd.yaml',
                    'console_ci_cd.yaml', 'backup_ci_cd.yaml', 'dashboard_ci_cd.yaml'), 300),
                  (('flyway_ci_cd.yaml', 'proxy_ci_cd.yaml'), 120),
                  (('rule_ci_cd.yaml', 'report_ci_cd.yaml', 'recorder_ci_cd.yaml', 'keycloak_ci_cd.yaml',
                    'eventwatcher_ci_cd.yaml', 'empa_ci_cd.yaml', 'controller_ci_cd.yaml', 'connectivity_ci_cd.yaml',
                    'api_ci_cd.yaml', 'admin_ci_cd.yaml', 'publisher_ci_cd.yaml'), 120),
                  (('ai_ci_cd.yaml', 'realm_ci_cd.yaml', 'smartmeter_ci_cd.yaml'), 180),
                  (('nginx_ci_cd.yaml', 'kubernetes_dashboard_ci_cd.yaml', 
                    'rabbitmq_ci_cd.yaml', 'keda_ci_cd.yaml'), 120))


def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--cluster', type=str, default='all')
    parser.add_argument('--token', type=str, default=os.getenv('GITHUB_TOKEN'))
    args = parser.parse_args()
    return args


def start_workflow(workflow_file, cluster: str, token: str):
    url = f'https://api.github.com/repos/{OWNER}/{REPO}/actions/workflows/{workflow_file}/dispatches'
    res = requests.post(url,
                        headers={'Accept': 'application/vnd.github.v3+json',
                                 'Authorization': f'token {token}'},
                        json={'ref': 'main', 'inputs': {'cluster': cluster}})
    if not res.ok:
        logging.error(
            f'starting workflow failed: {({"status_code": res.status_code, "text": res.text})} for workflow {workflow_file} with url: {url}')
        # "headers": res.headers
        sys.exit(1)


def get_cluster_workflow_files():
    all_workflow_files = set(
        [x.name for x in pathlib.Path(os.path.join(os.pardir, '.github', 'workflows')).glob('*.yaml')])
    return all_workflow_files - NON_CLUSTER_WORKFLOW_FILES - {OWN_WORKFLOW_FILE}


def main():
    logging.getLogger().setLevel(logging.INFO)
    args = get_args()
    for cluster in get_clusters(args.cluster):
        remaining_cluster_workflow_files = get_cluster_workflow_files()
        for workflow_files, timeout in CLUSTER_CONFIG:
            for workflow_file in workflow_files:
                start_workflow(workflow_file, cluster, args.token)
                remaining_cluster_workflow_files.remove(workflow_file)
            time.sleep(timeout)
        assert len(remaining_cluster_workflow_files) == 0


if __name__ == '__main__':
    main()
