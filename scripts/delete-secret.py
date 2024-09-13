import argparse
import logging
import subprocess

from constants import get_clusters
from deploy_and_restart import set_k8s_context


def parse_args() -> argparse.Namespace:
    """
    Parse command line arguments.

    Returns:
        argparse.Namespace: Parsed command line arguments.
    """
    parser = argparse.ArgumentParser()
    parser.add_argument('--cluster', type=str, required=True)
    parser.add_argument('--secret', type=str, required=True)
    parser.add_argument('--namespace_name', type=str, required=True)

    parser.set_defaults(replace_domain=False)
    return parser.parse_args()


def delete_secret(secret: str, namespace: str) -> None:
    """
    Delete a secret in a given namespace.

    Args:
        secret (str): Name of the secret to delete.
        namespace (str): Name of the namespace.

    Returns:
        None
    """
    subprocess.run(
        [f'kubectl delete secret {secret} -n {namespace}'], shell=True, check=True)


def main() -> None:
    """
    Main function to delete a secret from multiple clusters.

    This function sets the logging level to INFO, parses command line arguments,
    retrieves a list of clusters based on the provided cluster name, and then
    iterates over each cluster to delete the specified secret in the given namespace.

    Args:
        None

    Returns:
        None
    """
    logging.getLogger().setLevel(logging.INFO)
    args = parse_args()
    clusters = get_clusters(args.cluster)
    for cluster in clusters:
        set_k8s_context(cluster)
        delete_secret(args.secret, args.namespace_name)


if __name__ == '__main__':
    main()
