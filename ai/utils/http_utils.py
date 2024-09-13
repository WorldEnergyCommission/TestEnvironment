import os

import numpy as np
import pandas as pd
import requests

from ai.utils.numpy_utils import contains_numpy_array_valid_data
from ai.utils.request_utils import RequestSession, MEDIUM_TIMEOUT_SECONDS, HIGH_TIMEOUT_SECONDS
from ai.utils.time_utils import get_pandas_timestamps


def get_empa_url() -> str:
    """returns url of the empa module"""

    return os.getenv("EMPA_ADDR")

def get_mpc_url() -> str:
    """returns url of the empa module"""

    return os.getenv("MPC_ADDR")


def fetch_data_from_http(variable_name: str, project_id: str, start: int, end: int,
                         sample_time: str = "15m", agg: str = "avg", last_value_fill: bool = False) -> np.array:
    """returns a numpy array out of the sampled values of the requested variable and
    eventually fills up the data with the last value if no data was returned by the api"""

    params = {
        "var": variable_name,
        "start": start,
        "end": end,
        "type": agg,
        "sample_time": sample_time,
        "project": project_id
    }

    r = RequestSession.get_session().get(url=(get_empa_url() + "data"),
                                         timeout=HIGH_TIMEOUT_SECONDS,
                                         params=params)
    json_response = get_json_response(r)
    data = np.array(json_response)

    if last_value_fill and not contains_numpy_array_valid_data(data[:, 1]):
        last_value = fetch_last_value(variable_name, project_id)
        data[:, 1] = last_value

    return data


def append_data_to_dataframe_http(df: pd.DataFrame, data: np.array, name: str) -> pd.DataFrame:
    """append the values and timestamps from data to the dataframe
    and return a new copy to get a defragmented dataframe"""

    if "ts" not in df.columns:
        t = get_pandas_timestamps(data[:, 0])
        df["ts"] = t
    df[name] = data[:, 1]
    return df.copy()


def fetch_last_value(variable_name: str, project_id: str) -> float:
    """fetch last value of the passed variable"""

    params = {
        "var": variable_name,
        "project": project_id
    }

    r = RequestSession.get_session().get(url=(get_empa_url() + "data/last"),
                                         timeout=MEDIUM_TIMEOUT_SECONDS,
                                         params=params)
    json_response = get_json_response(r)
    return json_response["value"]


def get_json_response(response: requests.Response) -> dict | list:
    """check if the response is valid and json decodable"""

    try:
        json_response = response.json()
        json_decodable = True
    except requests.exceptions.JSONDecodeError:
        json_response = None
        json_decodable = False
    if response.ok and json_decodable:
        return json_response
    else:
        raise ValueError(
            f'json request to url {response.url} was not successful -> {(response.status_code, response.text)}')
