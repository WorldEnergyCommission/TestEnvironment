import os
import subprocess


def format_prettier_files(folder_path):
    # format all prettier files
    subprocess.run(
        ['npx', 'prettier', '--write', folder_path], shell=True, check=True)


def format_python_files(folder_path):
    # format all python files
    subprocess.run(
        ['py', '-m', 'autopep8', '--in-place', '--recursive', folder_path], check=True)


def format_go_files(folder_path):
    # format all go files
    subprocess.run(
        ['gofmt', '-w', folder_path], check=True)


def format_dart_files(folder_path):
    # format all dart files
    subprocess.run(['dart', 'format', folder_path], shell=True, check=True)


# format all relevant source files
if __name__ == '__main__':

    # prettier files
    format_prettier_files(os.pardir)

    # python files
    format_python_files(os.pardir)

    # go files
    format_go_files(os.pardir)

    # dart files
    format_dart_files(os.pardir)

    # check if a file has changed
    if 'nothing to commit, working tree clean' not in subprocess.run(
            ['git', 'status'], capture_output=True, check=True).stdout.decode('utf-8'):
        raise RuntimeError
