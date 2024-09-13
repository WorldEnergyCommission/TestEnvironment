import collections.abc

import numpy as np
import pandas as pd
import scipy.ndimage

from ai.utils.data_utils import encode_timestamp
from ai.utils.pandas_utils import check_pandas_object_for_invalid_data


def default_end_callback(df: pd.DataFrame) -> pd.DataFrame:
    """the default callback for the end of the preprocessing"""

    return df


def default_gaussian_filter_sigma_mode_callback(column_name: str) -> tuple[float, str]:
    """the default callback for the filter parameters"""

    return 1 if column_name == 'outdoor_temperature' else 0.5, 'nearest'


def get_duplicate_column_name(column_name: str) -> str:
    return f'{column_name}_duplicate'


def preprocess_dataframe(
        df: pd.DataFrame,
        df_resample_offset: str = '',
        replace_none_with_nan: bool = True,
        infer_datatypes: bool = True,
        clip_config_dict: dict[str, tuple[float |
                                          None, float | None]] | None = None,
        remove_duplicates: bool = False,
        interpolate_values: bool = True,
        gaussian_filter_columns: tuple[str] = (),
        gaussian_filter_sigma_mode_callback: collections.abc.Callable[[str], tuple[float, str]] =
        default_gaussian_filter_sigma_mode_callback,
        check_for_invalid_data: bool = True,
        encode_timestamps: bool = False,
        add_hour: bool = False,
        end_callback: collections.abc.Callable[[
            pd.DataFrame], pd.DataFrame] = default_end_callback,
) -> pd.DataFrame:
    """this function should unify the preprocessing"""

    if df_resample_offset != '':
        # TODO: second layer Hardcoded. First in http get
        df = df.resample(df_resample_offset).first()
    for column in df.columns:
        if replace_none_with_nan:
            df[column] = df[column].fillna(np.nan)
        if infer_datatypes:
            df[column] = df[column].infer_objects()
        if clip_config_dict is not None and column in clip_config_dict:
            column_clip_config = clip_config_dict[column]
            df[column] = df[column].clip(
                lower=column_clip_config[0], upper=column_clip_config[1])
        if remove_duplicates:
            df[get_duplicate_column_name(column)] = df[column].shift(1)
            df[column] = df.apply(
                lambda x: np.nan if x[column] == x[get_duplicate_column_name(
                    column)] else x[column],
                axis=1)
            df = df.drop(get_duplicate_column_name(column), axis=1)
        if interpolate_values:
            df[column] = df[column].interpolate(
                'linear', limit_direction='both')
        if column in gaussian_filter_columns:
            sigma, mode = gaussian_filter_sigma_mode_callback(column)
            df[column] = scipy.ndimage.gaussian_filter(
                df[column].values, sigma=sigma, mode=mode)
        if check_for_invalid_data:
            check_pandas_object_for_invalid_data(df[column])
    if encode_timestamps:
        encode_timestamp(df, add_hour=add_hour)
    return end_callback(df)
