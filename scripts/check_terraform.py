import argparse
import logging
import os
import subprocess

from constants import get_clusters
from replace_in_file_from_environment import replace_in_file_from_environment, replace_in_file_from_keepass

SUCCESS_STRING = 'Your infrastructure matches the configuration.'


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--cluster', type=str, required=True)
    parser.add_argument('--mode', type=str, default='check')
    parser.add_argument('--keepass_file_path', type=str, default='')
    parser.add_argument('--keepass_master_password', type=str, default='')
    return parser.parse_args()


def initialize_terraform() -> None:
    subprocess.run('terraform init -upgrade', shell=True, check=True)


def get_terraform_state_folder(cluster: str) -> str:
    return os.path.join(cluster)


def get_terraform_state_file_path(cluster: str) -> str:
    return os.path.join(get_terraform_state_folder(cluster), 'terraform.tfstate')


def check_cluster_state(cluster: str) -> None:
    terraform_state_path = get_terraform_state_file_path(cluster)
    if not os.path.exists(terraform_state_path):
        logging.info('No terraform state file was found')
        return
    try:
        terraform_process = subprocess.run([f'terraform plan -state {terraform_state_path}'],
                                           shell=True, check=True, capture_output=True, cwd = os.getcwd())
    except subprocess.CalledProcessError as e:
        print(f'stderr: {e.stderr.decode("utf-8")}\nstdout: {e.stdout.decode("utf-8")}')
        raise e
    terraform_process_output = terraform_process.stdout.decode('utf-8')
    if SUCCESS_STRING not in terraform_process_output:
        raise RuntimeError('The infrastructure of the specified cluster does not match the configuration')
    logging.info(SUCCESS_STRING)


def apply_cluster_config(cluster: str) -> None:
    if not os.path.exists(get_terraform_state_folder(cluster)):
        logging.info('No terraform state folder was found')
        return
    terraform_state_path = get_terraform_state_file_path(cluster)
    terraform_plan_process = subprocess.run(f'terraform plan -state {terraform_state_path}',
                                       shell=True, check=True)
    input('Check the plan and approve it with ENTER ...')
    terraform_apply_process = subprocess.run(f'terraform apply -state {terraform_state_path} -auto-approve',
                                       shell=True, check=True)


def main() -> None:
    logging.getLogger().setLevel(logging.INFO)
    os.chdir(os.path.join('infrastructure', 'terraform'))
    initialize_terraform()
    args = parse_args()
    for cluster in get_clusters(args.cluster):
        # save the variables file state
        with open('variables.tf') as file:
            variables_file_copy = file.read()
        # executes the check that requires replacements to the file
        if args.mode == 'check':
            replace_in_file_from_environment('variables.tf', cluster, True)
            check_cluster_state(cluster)
        elif args.mode == 'apply':
            replace_in_file_from_keepass('variables.tf', cluster, True, args.keepass_file_path,
                                         args.keepass_master_password)
            apply_cluster_config(cluster)
        # restore the initial state of the variables file
        with open('variables.tf', 'w') as file:
            file.write(variables_file_copy)


if __name__ == '__main__':
    main()
