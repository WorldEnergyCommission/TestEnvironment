import argparse
import os
import pathlib
import subprocess


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--update_packages', action='store_true')
    parser.add_argument('--no_update_packages',
                        dest='update_packages', action='store_false')
    parser.set_defaults(update_packages=True)
    return parser.parse_args()


def update_go_packages(folder_path: str, update_packages: bool) -> None:
    # find all go directories
    go_directories = [x.parent for x in pathlib.Path(
        folder_path).rglob('*') if x.is_file() and x.name == 'go.mod']
    # update packages in each directory
    for go_directory in go_directories:
        if update_packages:
            subprocess.run(
                ['go', 'get', '-u'], cwd=go_directory, check=True)
        subprocess.run(
            ['go', 'mod', 'tidy'], cwd=go_directory, check=True)


def main() -> None:
    # parse arguments
    args = parse_args()
    # update go packages
    update_go_packages(os.pardir, args.update_packages)


if __name__ == '__main__':
    main()
