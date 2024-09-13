import os
import pathlib
import subprocess


def update_javascript_packages(folder_path):
    # find all javascript directories
    javascript_directories = [x.parent for x in pathlib.Path(
        folder_path).rglob('*') if x.is_file() and x.name == 'package.json']
    # update packages in each directory
    for javascript_directory in javascript_directories:
        subprocess.run(
            ['npx', 'ncu', '-t', 'minor', '-u', '--packageFile', 'package.json'], cwd=javascript_directory, check=True,
            shell=True)
        subprocess.run(
            ['npm', 'install'], cwd=javascript_directory, check=True, shell=True)


if __name__ == '__main__':
    # update javascript packages
    update_javascript_packages(os.pardir)
