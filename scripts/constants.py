ALL_CLUSTERS = ['eneries', 'peneder']


def get_clusters(cluster: str) -> list[str]:
    if cluster == 'all':
        clusters = ALL_CLUSTERS
    else:
        clusters = [cluster]
    return clusters
