import rrcf


def anomaly_score(forest: list[rrcf.RCTree], point: float) -> float:
    """calculates the anomaly score of a new point without putting it inside the forest"""

    if len(forest) == 0:
        raise ValueError(
            "empty forest, use fit before you try to calculate an anomaly score")

    score = 0

    for tree in forest:
        tree.insert_point(point, -1)

        codisp = tree.codisp(-1)

        score += (codisp / (len(tree.leaves) - 1))

        tree.forget_point(-1)

    return score * 100 / len(forest)
