import math

import pandas as pd


def haversine(lon1: float, lat1: float, lon2: float, lat2: float, radius: float = 6371) -> float:
    """determines the great-circle distance between two points on a sphere
    given their longitudes, latitudes and the sphere radius (default is earth radius)"""

    # convert decimal degrees to radians
    lon1, lat1, lon2, lat2 = map(math.radians, [lon1, lat1, lon2, lat2])

    # haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2) ** 2
    c = 2 * math.asin(math.sqrt(a))
    return c * radius


def get_std_with_default(x: pd.Series, default_std: float = 1E-3) -> float:
    """gets the std of a series with a default value if it has a length of 1"""

    if len(x) == 1:
        return default_std
    return x.std()
