import os
import subprocess


def lint_python_files(folder_path):
    # lint all python files
    subprocess.run(
        ['py', '-m', 'pylint', folder_path, '--recursive', 'yes', '--fail-under=6'], check=True)


# lint all relevant source files
if __name__ == '__main__':
    # prettier files
    # lint_prettier_files(os.pardir)

    # python files
    lint_python_files(os.pardir)

    # go files
    # lint_go_files(os.pardir)

    # dart files
    # lint_dart_files(os.pardir)
