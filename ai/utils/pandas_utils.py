import numpy as np
import pandas as pd

INVALID_VALUES: set[object] = {None, np.nan}


def get_unique_objects_of_pandas_object(data: pd.DataFrame | pd.Series) -> set[object]:
    """get all unique objects in the pandas object"""

    return set(pd.unique(data.values.ravel('K')))


def get_invalid_data_of_pandas_object(data: pd.DataFrame | pd.Series) -> set[object]:
    """get all invalid data objects in the pandas object"""

    present_values_set = get_unique_objects_of_pandas_object(data)
    return present_values_set.intersection(INVALID_VALUES)


def contains_pandas_object_invalid_data(data: pd.DataFrame | pd.Series) -> bool:
    """check if there are any invalid data objects in the pandas object"""

    return len(get_invalid_data_of_pandas_object(data)) > 0


def contains_pandas_object_valid_data(data: pd.DataFrame | pd.Series) -> bool:
    """check if there are any valid data objects in the pandas object"""

    present_values_set = get_unique_objects_of_pandas_object(data)
    return not present_values_set.issubset(INVALID_VALUES)


def check_pandas_object_for_invalid_data(data: pd.DataFrame | pd.Series) -> None:
    """check if the pandas object contains invalid values and raise an error if this is the case"""

    if contains_pandas_object_invalid_data(data):
        if isinstance(data, pd.Series):
            raise ValueError(f'the passed series "{data.name}" contained '
                             f'the following invalid values: {get_invalid_data_of_pandas_object(data)}, '
                             f'the object was:\n{data.to_string()}')
        elif isinstance(data, pd.DataFrame):
            raise ValueError(f'the passed dataframe with columns {list(data.columns)} only contained '
                             f'the following invalid values: {get_invalid_data_of_pandas_object(data)}, '
                             f'the object was:\n{data.to_string()}')
        else:
            raise TypeError(f'invalid argument was provided')
