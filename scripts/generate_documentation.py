import os
import pathlib
import subprocess


def generate_go_documentation():
    for folder_name in [x.name for x in pathlib.Path(os.pardir).glob('*') if x.is_dir()]:
        eventual_go_folder = os.path.join(os.pardir, folder_name)
        if os.path.exists(os.path.join(eventual_go_folder, 'go.mod')):
            destination_path = '/'.join((os.pardir, 'docs', 'go', folder_name))
            os.makedirs(destination_path, exist_ok=True)
            subprocess.run(
                ['godoc-static', f'-destination={destination_path}', eventual_go_folder])


if __name__ == '__main__':
    generate_go_documentation()
