import argparse
import os
import subprocess

from deploy_and_restart import replace_in_file


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument('--registry', type=str, required=True)
    parser.add_argument('--user', type=str, required=True)
    parser.add_argument('--password', type=str, required=True)
    parser.add_argument('--repository', type=str, required=True)
    parser.add_argument('--image', type=str, required=True)
    parser.add_argument('--sha', type=str, required=True)
    parser.add_argument('--context_path', type=str, required=True)
    parser.add_argument('--dockerfile_path', type=str, required=True)
    parser.add_argument('--replace_version', type=str, required=False, default='false')
    return parser.parse_args()


def build_and_push_dockerfile(registry: str, user: str, password: str, repository: str, image: str,
                              sha: str, context_path: str, dockerfile_path: str, replace_version: str) -> None:
    if replace_version == 'true':
        version_file_path = os.path.join(os.path.dirname(dockerfile_path), 'version.json')
        replace_in_file(version_file_path, 'SHA', sha)
    docker_url_base = f'{registry}/{repository.lower()}/{image}'
    docker_url_sha = f'{docker_url_base}:{sha}'
    docker_url_latest = f'{docker_url_base}:latest'
    subprocess.run([f'docker login {registry} -u {user} -p {password}'], shell=True, check=True)
    try:
        subprocess.run([f'docker pull {docker_url_sha}'], shell=True, check=True)
    except subprocess.CalledProcessError:
        subprocess.run([f'docker build {context_path} --no-cache -f {dockerfile_path} '
                        f'-t {docker_url_sha} -t {docker_url_latest}'], shell=True, check=True)
        subprocess.run([f'docker push {docker_url_sha}'], shell=True, check=True)
        subprocess.run([f'docker push {docker_url_latest}'], shell=True, check=True)


def main() -> None:
    args = parse_args()
    build_and_push_dockerfile(args.registry, args.user, args.password, args.repository, args.image,
                              args.sha, args.context_path, args.dockerfile_path, args.replace_version)


if __name__ == '__main__':
    main()
