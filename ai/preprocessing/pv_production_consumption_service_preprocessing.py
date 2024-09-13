import pandas as pd

from ai.utils.data_utils import forecast_feature, autoregressive_feature
from ai.utils.preprocessing_utils import preprocess_dataframe


def preprocess_pv_production_consumption_service_data(
        df: pd.DataFrame, remove_duplicates: bool = False, remove_anomalies: bool = False) -> pd.DataFrame:
    """preprocesses data for pv model training, interpolates missing values, smooths input, calculates time features

    :param df: the pandas dataframe containing the input data
    :param remove_duplicates: whether to remove duplicated features
    :param remove_anomalies: whether to remove outliers
    """

    # preprocess the df using this common function
    return preprocess_dataframe(df,
                                df_resample_offset='15min',
                                clip_config_dict={'power': (0, 300)} if remove_anomalies else {},
                                remove_duplicates=remove_duplicates,
                                gaussian_filter_columns=tuple(df.columns),
                                encode_timestamps=True)


def get_pv_production_consumption_service_features(
        df: pd.DataFrame, lag_steps: list[int], prediction_steps: list[int],
        time_resolution: int, lag_label: list[int] = None) -> tuple[pd.DataFrame, pd.DataFrame]:
    """reforms the data into trainings features for pv training

    :param df: pandas dataframe that hold the feature data
    :param lag_steps: how many timesteps the features should lack behind
    :param prediction_steps: how many timesteps the features look ahead
    :param time_resolution: frequency of the features
    :param lag_label: how many timesteps the label lacks behind
    """

    columns = ["outdoor_temperature", "horizontal_radiation",
               "diffuse_radiation", "inclined_radiation"]

    for column in columns:
        temp = forecast_feature(df[column], prediction_steps, time_resolution)
        df = pd.concat([df, temp], axis=1, sort=True)

        temp = autoregressive_feature(df[column], lag_steps, time_resolution)
        df = pd.concat([df, temp], axis=1, sort=True)

    if lag_label is not None:
        temp = autoregressive_feature(df["power"], lag_label, 15)
        df = pd.concat([df, temp], axis=1, sort=True)

    df.dropna(inplace=True)

    x = df.drop(["power"], axis=1)
    y = df.power

    return x, y
