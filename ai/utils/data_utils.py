import datetime

import numpy as np
import pandas as pd


def minute_of_day(timestamp: datetime.datetime) -> float:
    """calculates the minute of the day from a datetime object

    :param timestamp: the timestamp to use
    """

    # Add up minute of the day terms
    minute = timestamp.hour * 60
    minute += timestamp.minute
    minute += timestamp.second / 60
    minute += timestamp.microsecond / (60 * 1e6)
    return minute


def minute_of_hour(timestamp: datetime.datetime) -> float:
    """calculates the minute of the hour from a datetime object

    :param timestamp: the timestamp to use
    """

    minute = timestamp.minute
    minute += timestamp.second / 60
    minute += timestamp.microsecond / (60 * 1e6)
    return minute


def cosine_minute(timestamp: datetime.datetime) -> np.array:
    """encodes the minute of the day with a cosine function

    :param timestamp: the timestamp to encode
    """

    # Calculate minute of the day
    minutes = minute_of_day(timestamp)
    # Cosine encoding
    t_cos = np.cos(2 * np.pi * minutes / 1440)
    # Remove numerical errors
    t_cos = np.where(np.abs(t_cos) > 1e-10, t_cos, 0.0)

    return t_cos


def cosine_minute_of_hour(timestamp: datetime.datetime) -> np.array:
    """encodes the minute of the day with a cosine function

    :param timestamp: the timestamp to encode
    """

    # Calculate minute of the hour
    minutes = minute_of_hour(timestamp)
    # Cosine encoding
    t_cos = np.cos(2 * np.pi * minutes / 60)
    # Remove numerical errors
    t_cos = np.where(np.abs(t_cos) > 1e-10, t_cos, 0.0)

    return t_cos


def sine_minute(timestamp: datetime.datetime) -> np.array:
    """encodes the minute of the day with a sine function

    :param timestamp: the timestamp to encode
    """

    # Calculate minute of the day
    minutes = minute_of_day(timestamp)
    # Sine encoding
    t_sine = np.sin(2 * np.pi * minutes / 1440)
    # Remove numerical errors
    t_sine = np.where(np.abs(t_sine) > 1e-10, t_sine, 0.0)

    return t_sine


def sine_minute_of_hour(timestamp: datetime.datetime) -> np.array:
    """encodes the minute of the day with a sine function

    :param timestamp: the timestamp to encode
    """

    # Calculate minute of the hour
    minutes = minute_of_hour(timestamp)
    # Sine encoding
    t_sine = np.sin(2 * np.pi * minutes / 60)
    # Remove numerical errors
    t_sine = np.where(np.abs(t_sine) > 1e-10, t_sine, 0.0)

    return t_sine


def cosine_hour_of_day(timestamp: datetime.datetime) -> np.array:
    """encodes the day of the year with a cosine function

    :param timestamp: the timestamp to encode
    """

    # Get day of the year from timestamp
    d = timestamp.hour
    # Cosine encoding
    d_cos = np.cos(2 * np.pi * d / 24)
    # Remove numerical errors
    d_cos = np.where(np.abs(d_cos) > 1e-10, d_cos, 0.0)

    return d_cos


def sine_hour_of_day(timestamp: datetime.datetime) -> np.array:
    """encodes the day of the year with a sine function

    :param timestamp: the timestamp to encode
    """

    # Get day of the year from timestamp
    d = timestamp.hour
    # Sine encoding
    d_sin = np.sin(2 * np.pi * d / 24)
    # Remove numerical errors
    d_sin = np.where(np.abs(d_sin) > 1e-10, d_sin, 0.0)

    return d_sin


def cosine_day(timestamp: datetime.datetime) -> np.array:
    """encodes the day of the year with a cosine function

    :param timestamp: the timestamp to encode
    """

    # Get day of the year from timestamp
    d = timestamp.timetuple().tm_yday
    # Cosine encoding
    d_cos = np.cos(2 * np.pi * d / 365)
    # Remove numerical errors
    d_cos = np.where(np.abs(d_cos) > 1e-10, d_cos, 0.0)

    return d_cos


def sine_day(timestamp: datetime.datetime) -> np.array:
    """encodes the day of the year with a sine function

    :param timestamp: the timestamp to encode
    """

    # Get day of the year from timestamp
    d = timestamp.timetuple().tm_yday
    # Sine encoding
    d_sin = np.sin(2 * np.pi * d / 365)
    # Remove numerical errors
    d_sin = np.where(np.abs(d_sin) > 1e-10, d_sin, 0.0)

    return d_sin


def encode_timestamp(df: pd.DataFrame, add_hour: bool = False) -> None:
    """encode the current timestamp in various ways in the passed dataframe"""

    df['ts'] = pd.to_datetime(df.index)
    # depending on if hour should be included in dataframe
    # add hour of the day encoded, and encode minute of hour
    if add_hour:
        df["minute_sin"] = df['ts'].apply(sine_minute_of_hour)
        df["minute_cos"] = df['ts'].apply(cosine_minute_of_hour)
        df["hour_cos"] = df['ts'].apply(cosine_hour_of_day)
        df["hour_sin"] = df['ts'].apply(sine_hour_of_day)
    else:
        df["minute_sin"] = df['ts'].apply(sine_minute)
        df["minute_cos"] = df['ts'].apply(cosine_minute)

    df["day_cos"] = df['ts'].apply(cosine_day)
    df["day_sin"] = df['ts'].apply(sine_day)
    df.drop(columns='ts', inplace=True)


def forecast_feature(df: pd.Series, future_steps: list[int], time_resolution: int) -> pd.DataFrame:
    """creates forecast feature columns in the passed dataframe

    :param df: pandas time series object
    :param future_steps: how many future features should be created
    :param time_resolution: resolution of the time series object in minutes
    """

    result_df = pd.DataFrame()
    name = str(df.name)
    for step in future_steps:
        feature_name = name + '(k+' + str(int(step)) + 'min)'
        shift_amount = -int(step / time_resolution)
        result_df[feature_name] = df.shift(periods=shift_amount)
    return result_df


def autoregressive_feature(df: pd.Series, lag_steps: list[int], time_resolution: int) -> pd.DataFrame:
    """creates autoregressive feature columns in the passed dataframe

    :param df: pandas time series object
    :param lag_steps: how many timesteps the features should lack behind
    :param time_resolution: resolution of the time series object in minutes
    """

    result_df = pd.DataFrame()
    name = str(df.name)
    for step in lag_steps:
        feature_name = name + '(k-' + str(int(step)) + 'min)'
        shift_amount = int(step / time_resolution)
        result_df[feature_name] = df.shift(periods=shift_amount)
    return result_df
