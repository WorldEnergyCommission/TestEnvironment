ALL_CLUSTERS = ['efficientio', 'tsg', 'dev',
                'peneder', 'be', 'bms', 'effectas']


def get_clusters(cluster: str) -> list[str]:
    if cluster == 'all':
        clusters = ALL_CLUSTERS
    else:
        clusters = [cluster]
    return clusters
