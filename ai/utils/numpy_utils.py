import numpy as np
import pandas as pd

from ai.utils.pandas_utils import contains_pandas_object_valid_data


def contains_numpy_array_valid_data(data: np.array) -> bool:
    """check if there are any valid data objects in the numpy array"""

    return contains_pandas_object_valid_data(pd.Series(data))
