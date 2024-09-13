import pandas as pd

from ai.utils.http_utils import fetch_data_from_http, append_data_to_dataframe_http


def calculate_autarchy(start: int, end: int, project_id: str,
                       grid: list[str], pv: list[str], battery: list[str]) -> float:
    """calculate the autarchy score from the arguments"""

    agg = "15m"
    # if the time frame is big enough, the frequency has to become smaller
    if (end - start) > 864000:
        agg = "6h"

    factor = {"15m": 0.25,
              "1h": 1,
              "6h": 6}

    df = pd.DataFrame()

    # fetch grid power consumption
    if len(grid) != 1:
        raise ValueError('it is only allowed to specify one grid')
    data = fetch_data_from_http(grid[0], project_id, start, end, agg)
    df = append_data_to_dataframe_http(df, data, "grid")

    # fetch pv power for every pv site
    for i, p in enumerate(pv):
        data = fetch_data_from_http(p, project_id, start, end, agg)
        df = append_data_to_dataframe_http(df, data, "pv" + str(i))

    # fetch battery power for every installed battery
    for i, p in enumerate(battery):
        data = fetch_data_from_http(p, project_id, start, end, agg)
        df = append_data_to_dataframe_http(df, data, "bat" + str(i))

    df = df.set_index("ts")
    df = df.ffill()
    df = df.dropna(axis=0, subset=['grid'])
    df = df.fillna(0)
    df["consumption"] = df.sum(axis=1)
    total_consumption = df["consumption"].sum() * factor[agg]
    total_grid = (df["grid"] * (df["grid"] > 0)).sum() * factor[agg]
    return round(100 - float(round(total_grid / total_consumption, 3) * 100), 1)
