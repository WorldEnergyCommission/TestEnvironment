import logging
import os
import pathlib
import subprocess

import tap


class ScriptArgumentParser(tap.Tap):
    just_install: bool = False


def create_requirements_map(requirements_file_path: str) -> dict[str, str]:
    """get a requirements map from a requirements file"""

    requirements_map = {}
    with open(requirements_file_path, 'r') as file:
        for package, version in map(lambda x: x.split('=='), file.read().strip().split()):
            requirements_map[package] = version
    return requirements_map


def create_requirements_file(requirements_file_path: str, requirements_map):
    """create a new requirements file from a requirements map"""

    requirements_file_content = []
    for package, version in requirements_map.items():
        requirements_file_content.append(f'{package}=={version}\n')
    with open(requirements_file_path, 'w') as file:
        file.write(''.join(sorted(requirements_file_content)))


def get_latest_package_version(package: str) -> str:
    """get latest package version"""

    package_name_without_extras = package.split('[')[0]
    finished_process = subprocess.run(
        ['py', '-m', 'pip', 'index', 'versions', package_name_without_extras, '--disable-pip-version-check'],
        check=True, capture_output=True)
    return finished_process.stdout.decode('utf-8').strip().split()[-1]


def install_python_package(package: str, version: str) -> None:
    """install the specified python package"""

    logging.info(
        f'updating package {package} to version {version} ...')
    subprocess.run(
        ['py', '-m', 'pip', 'install', f'{package}=={version}', '--user'], check=True)


def update_python_packages(folder_path: str, just_install: bool) -> None:
    """update packages or just install specified packages"""

    # find all python directories
    python_directories = [x.parent for x in pathlib.Path(
        folder_path).rglob('*') if x.is_file() and x.name == 'requirements.txt']
    # update packages in each directory
    for python_directory in python_directories:
        input_requirements_map = create_requirements_map(
            os.path.join(python_directory, 'requirements.txt'))
        output_requirements_map = {}
        for package, current_version in input_requirements_map.items():
            latest_version = get_latest_package_version(package)
            if current_version != latest_version and not just_install:
                install_python_package(package, latest_version)
                output_requirements_map[package] = latest_version
            else:
                install_python_package(package, current_version)
                output_requirements_map[package] = current_version
        create_requirements_file(os.path.join(
            python_directory, 'requirements.txt'), output_requirements_map)


if __name__ == '__main__':
    # parse arguments
    args = ScriptArgumentParser().parse_args()
    # update python packages
    update_python_packages(os.pardir, args.just_install)
