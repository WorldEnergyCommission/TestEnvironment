import logging
import os
import pathlib


def get_container_tuples_from_dockerfile(dockerfile_path):
    with open(dockerfile_path, 'r') as file:
        dockerfile_content = file.read()
        used_containers = filter(lambda x: x != 'scratch', map(lambda x: x.split()[1],
                                                               filter(lambda x: x.startswith('FROM'),
                                                                      dockerfile_content.strip().split('\n'))))
        return map(lambda x: tuple(x.split(':')), used_containers)


def get_container_tuples_from_deployment_file(deployment_file_path):
    with open(deployment_file_path, 'r') as file:
        deployment_file_content = file.read()
        used_containers = map(lambda x: x.split()[1],
                              filter(lambda x: x.startswith('image: '),
                                     map(str.strip, deployment_file_content.strip().split('\n'))))
        return filter(lambda x: x[1] != 'TAG', map(lambda x: tuple(x.split(':')), used_containers))


def show_used_docker_containers(folder_path):
    # list of all used container tuples
    used_containers = []
    # find all docker directories
    docker_directories = [x.parent for x in pathlib.Path(
        folder_path).rglob('*') if x.is_file() and x.name == 'Dockerfile']
    # get all containers from each dockerfile
    for docker_directory in docker_directories:
        used_containers.extend(get_container_tuples_from_dockerfile(
            os.path.join(docker_directory, 'Dockerfile')))
    # find all deployment files
    deployment_files = [x for x in pathlib.Path(
        folder_path).rglob('*') if x.is_file() and x.name == 'deployment.yaml']
    # get all containers from each deployment file
    for deployment_file in deployment_files:
        used_containers.extend(
            get_container_tuples_from_deployment_file(deployment_file))
    # log all containers and versions that are unique
    used_containers = sorted(set(used_containers))
    for container, tag in used_containers:
        logging.info(f'{container}:{tag}')


if __name__ == '__main__':
    # set log level
    logging.basicConfig(level=logging.INFO)
    # show used docker containers
    show_used_docker_containers(os.pardir)
