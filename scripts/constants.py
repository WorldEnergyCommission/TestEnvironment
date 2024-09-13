ALL_CLUSTERS = ['eneries']


def get_clusters(cluster: str) -> list[str]:
    if cluster == 'all':
        clusters = ALL_CLUSTERS
    else:
        clusters = [cluster]
    return clusters
