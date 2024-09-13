import json
import os
import subprocess

if __name__ == '__main__':
    extensions = subprocess.run(['code', '--list-extensions'], shell=True,
                                capture_output=True, check=True).stdout.decode('utf-8').split()
    with open(os.path.join(os.pardir, '.vscode', 'extensions.json'), 'r') as file:
        extensions_json = json.load(file)
    extensions_json['recommendations'] = extensions
    with open(os.path.join(os.pardir, '.vscode', 'extensions.json'), 'w', newline='\n') as file:
        file.write(json.dumps(extensions_json, indent=2) + '\n')
