import argparse
import functools
import os
import pathlib
import shutil
import subprocess


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--whitelabel', type=str, required=True)
    parser.add_argument('--platform', type=str, default='all')
    return parser.parse_args()


def map_output_line(line: str) -> pathlib.Path:
    trimmed_start_line = line \
        .replace('CREATE android icon', '') \
        .replace('CREATE android splash-dark', '') \
        .replace('CREATE android splash', '') \
        .replace('CREATE ios notification-icon', '') \
        .replace('CREATE ios settings-icon', '') \
        .replace('CREATE ios spotlight-icon', '') \
        .replace('CREATE ios icon', '') \
        .replace('CREATE ios splash-dark', '') \
        .replace('CREATE ios splash', '')
    try:
        index_of_bracket = trimmed_start_line.index('(')
        trimmed_start_line = trimmed_start_line[:index_of_bracket]
    except ValueError:
        pass
    return pathlib.Path(trimmed_start_line.strip())


def get_android_target_path(whitelabel: str, source_path: pathlib.Path) -> pathlib.Path:
    target_path_parts = list(source_path.parts)
    main_index = target_path_parts.index('main')
    target_path_parts[main_index] = whitelabel
    return pathlib.Path(*target_path_parts)


def get_ios_target_path(whitelabel: str, source_path: pathlib.Path) -> pathlib.Path:
    target_path_parts = list(source_path.parts)
    target_path_parts[-2] = (whitelabel if whitelabel !=
                             'main' else '') + target_path_parts[-2]
    return pathlib.Path(*target_path_parts)


def generate_android_assets(whitelabel: str) -> None:
    generate_assets_process = subprocess.run(f'npx @capacitor/assets generate --assetPath assets/{whitelabel} --android',
                                             check=True, capture_output=True, shell=True)
    print(generate_assets_process.stdout.decode('utf-8'))
    output_lines = list(filter(lambda x: x.startswith('CREATE'),
                               generate_assets_process.stdout.decode('utf-8').strip().split('\n')))
    created_files = list(
        filter(lambda x: x.suffix == '.png', map(map_output_line, output_lines)))
    target_files = list(map(functools.partial(
        get_android_target_path, whitelabel), created_files))
    file_pairs_with_index = enumerate(zip(created_files, target_files))
    for index, (source_file, target_file) in file_pairs_with_index:
        os.makedirs(target_file.parent, exist_ok=True)
        if source_file != target_file:
            shutil.copyfile(source_file, target_file)
        if whitelabel != 'main':
            subprocess.run(f'git checkout "{source_file}"',
                           check=True, shell=True)
        print(
            f'generated android file {index + 1}/{len(target_files)} on path {target_file} ...')
    print(
        f'android asset file generation is done for whitelabel {whitelabel}!')


def get_content_files(paths: list[pathlib.Path]) -> list[pathlib.Path]:
    directories = set(map(lambda x: pathlib.Path(*x.parts[:-1]), paths))
    return [pathlib.Path(os.path.join(x, 'Contents.json')) for x in directories]


def generate_ios_assets(whitelabel: str) -> None:
    generate_assets_process = subprocess.run(f'npx @capacitor/assets generate --assetPath assets/{whitelabel} --ios',
                                             check=True, capture_output=True, shell=True)
    print(generate_assets_process.stdout.decode('utf-8'))
    output_lines = list(filter(lambda x: x.startswith('CREATE'),
                               generate_assets_process.stdout.decode('utf-8').strip().split('\n')))
    created_files = list(filter(lambda x: x.suffix == '.png',
                         map(map_output_line, output_lines)))
    augmented_created_files = created_files + get_content_files(created_files)
    target_files = list(map(functools.partial(
        get_ios_target_path, whitelabel), augmented_created_files))
    file_pairs_with_index = enumerate(
        zip(augmented_created_files, target_files))
    for index, (source_file, target_file) in file_pairs_with_index:
        os.makedirs(target_file.parent, exist_ok=True)
        if source_file != target_file:
            shutil.copyfile(source_file, target_file)
        if whitelabel != 'main':
            subprocess.run(f'git checkout "{source_file}"',
                           check=True, shell=True)

        print(
            f'generated ios file {index + 1}/{len(target_files)} on path {target_file} ...')

    print("Reverting unnecessary git chagnes...")
    if whitelabel != 'main':
        for created_file in created_files:
            source_folder_path_parts = list(created_file.parts)
            source_folder_path_parts = source_folder_path_parts[:-1]
            source_folder_path = pathlib.Path(*source_folder_path_parts)
            subprocess.run(f'git checkout -- "{source_folder_path}"',
                           check=True, shell=True)
    print(f'ios asset file generation is done for whitelabel {whitelabel}!')


def main() -> None:
    args = parse_args()
    os.chdir(os.path.join(os.path.dirname(
        os.path.abspath(__file__)), os.pardir, 'console'))
    if args.platform == "all" or args.platform == "android":
        generate_android_assets(args.whitelabel)
    if args.platform == "all" or args.platform == "ios":
        generate_ios_assets(args.whitelabel)


if __name__ == '__main__':
    main()
