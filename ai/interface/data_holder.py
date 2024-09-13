from __future__ import annotations

import abc

import pandas as pd

from ai.utils.http_utils import fetch_data_from_http, append_data_to_dataframe_http
from ai.utils.weather_utils import fetch_forecast


class DataHolder(abc.ABC):
    """each model has a corresponding dataholder that extends this base class, a dataholder is an object that contains
    static information of the model and also acts as a data interface for the historical time series data"""

    @abc.abstractmethod
    def __init__(self, device_id: str, project_id: str, type_name: str, collection_id: str, start: int | None,
                 site_id: int, ready: str, error: str, heart_beat: str, username: str, password: str, favorite: bool,
                 name: str, created_at: str, error_rule: str, warning_rule: str, addional_rules: list[str] = []) -> None:
        """inits the base data holder class, which contains information that every other data holder needs

        :param device_id: unique identifier for the dataholder and the corresponding model
        :param project_id: unique identifier for the project in which the dataholder and the model were created
        :param type_name: the model type of the corresponding model
        :param collection_id: unique identifier for collection in which the dataholder and the model were created
        :param start: indicates the starting date for the model training
        :param site_id: unique identifier for the connected weather site
        :param ready: output variable, to which the model writes its current state, 0 means its not yet trained,
            1 means it has been trained and is ready
        :param error: output variable to which the model writes in case of an error or a warning, 0 means no error
            or warnings, 1 means there is a warning, 2 means there is a error
        :param heart_beat: output variable for the model for the periodic heartbeat
        :param username: mqtt username
        :param password: mqtt password
        :param favorite: indicates whether the model has been set as favorite or not
        :param name: name of the model
        :param created_at: timestamp of when the model was created
        :param error_rule: error rule to send alerts when a error happens
        :param warning_rule: warning rule to send alerts when a error happens
        """

        self.device_id = device_id
        self.project_id = project_id
        self.collection_id = collection_id
        self.type_name = type_name
        self.start = start
        self.site_id = site_id
        self.ready = ready
        self.error = error
        self.heart_beat = heart_beat
        self.username = username
        self.password = password
        self.favorite = favorite
        self.name = name
        self.created_at = created_at
        self.error_rule = error_rule
        self.warning_rule = warning_rule
        self.addional_rules = addional_rules

    @classmethod
    @abc.abstractmethod
    def from_dict(cls, d: dict[str, ...]) -> DataHolder:
        """creates a dataholder from a dictionary

        :param d: dictionary that holds all the needed information to create a new dataholder
        """

        pass

    @abc.abstractmethod
    def get_data(self, start: int, end: int, agg: str = "avg") -> pd.DataFrame:
        """data interface for time series data

        :param start: start date of the requested data
        :param end: end date of the requested data
        :param agg: agg type of the requested data

        :return: dataframe that holds every variable that is needed for the model training
        """

        pass

    def _get_data(self, var: list[str], start: int, end: int, agg: str = "avg",
                  sample_rate: str = "15m") -> pd.DataFrame:
        """helper method to get historic data"""

        df = pd.DataFrame()
        for attr, value in self.__dict__.items():
            if attr in var:
                data = fetch_data_from_http(
                    value, self.project_id, start, end, sample_rate, agg=agg)
                df = append_data_to_dataframe_http(df, data, attr)

        return df

    @abc.abstractmethod
    def to_dict(self) -> dict[str, ...]:
        """generates a python dictionary representation of the instance"""

        pass

    def get_weather_forecast(self, action: str = "getforecast",
                             control: bool = False, labels_to_drop: list[str] = None) -> pd.DataFrame:
        """helper function to fetch the weather forecast"""

        if labels_to_drop is None:
            labels_to_drop = []
        forecast_df = fetch_forecast(
            self.site_id, action=action, control=control)
        if control:
            forecast_df.rename(
                columns={'temperature_forecast': "outdoor_temperature",
                         'solar_radiation_forecast': "solar_radiation"},
                inplace=True)
        else:
            forecast_df.rename(
                columns={'temperature_forecast': "outdoor_temperature",
                         'solar_radiation_forecast': "horizontal_radiation",
                         "diffuse_radiation_forecast": "diffuse_radiation",
                         "inclined_radiation_forecast": "inclined_radiation",
                         "normal_radiation_forecast": "normal_radiation"
                         },
                inplace=True)
        forecast_df['ts'] = pd.to_datetime(
            forecast_df['ts'].values, unit='s', utc=True).tz_convert("CET")
        forecast_df = forecast_df.set_index("ts").drop(labels_to_drop, axis=1)
        return forecast_df

    def is_next_generation(self) -> bool:
        """check if the model is next generation"""

        return self.name.endswith('_NG')
