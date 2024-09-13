import os
import subprocess

if __name__ == '__main__':
    subprocess.run(['choco', 'export', os.path.join(
        os.pardir, 'chocolatey', 'packages.config')], check=True)
    backup_file_path = os.path.join(
        os.pardir, 'chocolatey', 'packages.config.backup')
    if os.path.exists(backup_file_path):
        os.remove(backup_file_path)
