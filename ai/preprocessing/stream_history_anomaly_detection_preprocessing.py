import numpy as np
import pandas as pd
import rrcf

from ai.utils.preprocessing_utils import preprocess_dataframe


def preprocess_stream_history_anomaly_detection_data(df: pd.DataFrame) -> pd.DataFrame:
    """preprocesses data for the anomaly models and interpolates missing values

    :param df: pandas dataframe which gets preprocessed
    """

    # preprocess the df using this common function
    return preprocess_dataframe(df,
                                df_resample_offset='1min')


def get_stream_history_anomaly_detection_features(df: pd.DataFrame, shingle_size: int) -> np.array:
    """reforms the preprocessed data to fit an anomaly model

    :param df: the dataframe containing the samples
    :param shingle_size: indicates how many samples are looked at for the anomaly score calculation
    """

    x = None
    for i, c in enumerate(df.columns):
        points = rrcf.shingle(df[c], shingle_size)
        x_temp = [np.array(point) for point in points]
        if i == 0:
            x = x_temp.copy()
        else:
            x = np.concatenate([x, x_temp], axis=1)

    return np.array(x)
