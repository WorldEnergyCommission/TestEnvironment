import datetime
import time
from typing import Union

import numpy as np
import pandas as pd
import pytz


def get_timestamps(start: datetime.datetime, amount: int) -> np.array:
    """get timestamps with a distance of 15 minutes starting from start in a numpy array"""

    result = []
    for i in range(amount):
        result.append(int(start.timestamp()))
        start += datetime.timedelta(minutes=15)
    return np.array(result)


def compute_unix_timestamp_from_date_and_time_and_zone(date: str, time_string: str, zone: str = '+0000',
                                                       date_format: str = '%d.%m.%Y', time_format: str = '%H:%M:%S',
                                                       zone_format: str = '%z') -> float:
    """compute unix timestamp from a date, time and zone string and their formats"""
    datetime_object = datetime.datetime.strptime(' '.join((date, time_string, zone)),
                                                 ' '.join((date_format, time_format, zone_format)))
    return datetime_object.timestamp()


def get_current_datetime_in_tz(tz: str) -> datetime.datetime:
    """get the current datetime in a specific timezone"""

    return pytz.timezone(tz).fromutc(datetime.datetime.utcnow())


def get_pandas_timestamps(data: Union[np.array, float]) -> Union[pd.Series, pd.Timestamp]:
    """the array converted to date times"""

    return pd.to_datetime(data, unit='s', utc=True).tz_convert('CET')


def get_most_recent_timestamp_from_df(df: pd.DataFrame, return_int_index: bool = False) -> Union[pd.Timestamp, int]:
    """get the most recent index from the past"""

    current_time = get_pandas_timestamps(time.time())
    past_times = df[df.index < current_time]
    if return_int_index:
        return len(past_times) - 1
    else:
        return past_times.index.max()
