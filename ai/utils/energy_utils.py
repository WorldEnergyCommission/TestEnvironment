import datetime

import numpy as np
import pandas as pd
import pytz

from ai.utils.http_utils import fetch_data_from_http


def calculate_energy_of_day(power: str, project_id: str, pv: bool = True) -> float:
    """compute the daily energy from power measurements"""

    ts0 = datetime.datetime.now().astimezone(pytz.timezone("CET"))
    ts_start = int(ts0.timestamp() - 86400)
    ts_end = int(ts0.timestamp())

    df = pd.DataFrame()
    data = fetch_data_from_http(power, project_id, ts_start, ts_end, "30s")
    t = pd.to_datetime(data[:, 0], unit='s', utc=True).tz_convert('CET')
    df["ts"] = t
    df["power"] = data[:, 1]

    df = df.set_index("ts")

    start = datetime.datetime.now(tz=pytz.timezone("CET")).replace(
        hour=0, minute=0, second=0, microsecond=0)
    end = datetime.datetime.now(tz=pytz.timezone(
        "CET")).replace(second=0, microsecond=0)
    df = df.ffill().loc[start:end]
    if pv:
        en = np.cumsum(df.power * (df.power > 0) * 0.5 / 60)
    else:
        en = np.cumsum(df.power * 0.5 / 60)

    if end.hour == 23:
        if datetime.datetime.now(tz=pytz.timezone("CET")).hour == 0:
            return 0

    if end.hour == 23:
        if end.minute > 55:
            return 0

    if start.day != end.day:
        return 0

    return float(en[-1])
