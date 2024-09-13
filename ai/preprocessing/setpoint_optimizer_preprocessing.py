import numpy as np
import pandas as pd

from ai.data_holder.setpoint_optimizer_data_holder import SetpointOptimizerDataHolder
from ai.utils.preprocessing_utils import preprocess_dataframe
from ai.utils.temperature_control_system_utils import TemperatureControlSystem


class SetpointOptimizerPreprocessingEndCallback:
    def __init__(self, top: bool = False):
        self.top = top

    def end_callback(self, df: pd.DataFrame) -> pd.DataFrame:
        """end callback for preprocessing"""

        room_temperatures = {}
        to_drop = []
        for column in df.columns:
            if "room_temperature" in column:
                if np.mean(df[column]) > 100:
                    to_drop.append(column)
                    continue
                key = column.split("_")
                key = key[0] + "_" + key[1] + "_" + key[2]
                if key not in room_temperatures.keys():
                    room_temperatures[key] = []
                room_temperatures[key].append(column)
                to_drop.append(column)
        for key in room_temperatures.keys():

            if self.top and len(room_temperatures[key]) > 1:
                number_room_temperatures = len(room_temperatures[key])
                number_top_values = min((number_room_temperatures + 1) // 2, 3)

                df[key + "_room_temperature_avg"] = df[room_temperatures[key]].apply(
                    lambda row: avg_of_x_highest(row, number_top_values), axis=1)
            else:
                df[key + "_room_temperature_avg"] = df[room_temperatures[key]
                                                       ].sum(axis=1) / len(room_temperatures[key])
        return df.drop(to_drop, axis=1)


def avg_of_x_highest(row, x):
    """returns the average of the x highest value of a row"""
    sorted_values = sorted(row, reverse=True)
    return sum(sorted_values[:x]) / x


def preprocess_setpoint_optimizer_data(df: pd.DataFrame, top: bool = False) -> pd.DataFrame:
    """preprocesses the setpoint optimizer data for the control step and model training,
    removes outliers and interpolates missing values

    :param df: the pandas dataframe containing the input data
    """
    cb = SetpointOptimizerPreprocessingEndCallback(top)

    # preprocess the df using this common function
    return preprocess_dataframe(df,
                                end_callback=cb.end_callback)


def get_setpoint_optimizer_features(dh: SetpointOptimizerDataHolder) -> dict[str, list[str]]:
    """reforms the setpoint optimizer features for the model training and the control step

    :param dh: the setpoint optimizer data holder
    """

    x = {}

    for key in ["heating_water", "heating_air", "cooling_water", "cooling_air", "hybrid_air", "hybrid_water"]:
        x[key] = []

    for s in dh.heating_water_systems:
        s: TemperatureControlSystem
        x["heating_water"].append(s.identifier)

    for s in dh.heating_air_systems:
        s: TemperatureControlSystem
        x["heating_air"].append(s.identifier)

    for s in dh.cooling_water_systems:
        s: TemperatureControlSystem
        x["cooling_water"].append(s.identifier)

    for s in dh.cooling_air_systems:
        s: TemperatureControlSystem
        x["cooling_air"].append(s.identifier)

    for s in dh.hybrid_air_systems:
        s: TemperatureControlSystem
        x["hybrid_air"].append(s.identifier)

    for s in dh.hybrid_water_systems:
        s: TemperatureControlSystem
        x["hybrid_water"].append(s.identifier)

    return x
