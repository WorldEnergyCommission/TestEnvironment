from __future__ import annotations

import datetime
import logging
import math
import traceback
import numpy as np
import pandas as pd

from ai.interface.data_holder import DataHolder
from ai.utils.http_utils import fetch_data_from_http, append_data_to_dataframe_http
from ai.utils.holiday_workday_utils import get_holiday_range, load_project_operating_hours, get_week_holiday, \
    load_project_holidays, get_weekday


class LoadMonitorDataHolder(DataHolder):
    def __init__(self, device_id: str, collection_id: str, project_id: str, heart_beat: str, error: str,
                 ready: str, name: str, username: str, password: str, created_at: str, favorite: bool, error_rule: str, warning_rule: str,
                 power: str, site_id: int, baking_window_duration: int, type_name: str = "LoadMonitor", addional_rules: list[str] = []):
        """creates the load monitor data holder class, which contains static information which is needed
        to train and deploy the model

        :param device_id: unique identifier for the dataholder and the corresponding model
        :param collection_id: unique identifier for collection in which
            the dataholder and the model were created
        :param project_id: unique identifier for the project in which
            the dataholder and the model were created
        :param heart_beat: output variable for the model for the periodic heartbeat
        :param error: output variable to which the model writes in case of an error or a warning,
            0 means no error or warnings, 1 means there is a warning, 2 means there is a error
        :param ready: output variable, to which the model writes its current state,
            0 means its not yet trained, 1 means it has been trained and is ready
        :param name: name of the model
        :param username: mqtt username
        :param password: mqtt password
        :param created_at: timestamp of when the model was created
        :param favorite: indicates whether the model has been set as favorite or not
        :param error_rule: error rule to send alerts when a error happens
        :param warning_rule: warning rule to send alerts when a error happens
        :param power: input variable that holds the power data of the device
        :param site_id: unique identifier for the connected weather site
        :param type_name: the model type of the corresponding model, defaults to "LoadMonitor"
        :param addional_rules: list of id's of addional rules
        :param baking_window_duration: amount of minutes 
        """

        self.power = power
        self.type_name = type_name
        super().__init__(device_id=device_id, project_id=project_id, collection_id=collection_id,
                         start=None, site_id=site_id, ready=ready, error=error, heart_beat=heart_beat,
                         username=username, password=password, favorite=favorite, name=name, created_at=created_at,
                         error_rule=error_rule, warning_rule=warning_rule, type_name=type_name, addional_rules=addional_rules)
        self.baking_window_duration = baking_window_duration

    @classmethod
    def from_dict(cls, d: dict[str, ...]) -> LoadMonitorDataHolder:
        """get an instance from a dictionary"""

        controller_mappings = d["data"]["meta"]["controllerMappings"]

        if "settings" in d["data"]["meta"].keys():
            settings = d["data"]["meta"]["settings"]
        else:
            settings = {"bakingWindowDuration": 120}

        if "bakingWindowDuration" in settings.keys():
            baking_window_duration = settings.get("bakingWindowDuration")
        else:
            baking_window_duration = 120

        return cls(project_id=d["project_id"], device_id=d["id"], collection_id=d["collection_id"],
                   heart_beat=controller_mappings["heartbeat"], ready=controller_mappings["mpcReady"],
                   error=controller_mappings["errorWarning"], name=d["name"], created_at=d["created_at"],
                   favorite=d["favorite"], error_rule=d["data"]["meta"]["errorRule"], baking_window_duration=baking_window_duration,
                   warning_rule=d["data"]["meta"]["warningRule"], site_id=d["data"]["meta"]["site_id"],
                   username=d["data"]["meta"]["username"], password=d["data"]["meta"]["password"],
                   power=controller_mappings["power"], addional_rules=d["data"]["meta"].get("addional_rules", []))

    def to_dict(self) -> dict[str, ...]:
        """convert the current instance to a dictionary"""

        d = {"collection_id": self.collection_id,
             "project_id": self.project_id,
             "created_at": self.created_at,
             "name": self.name,
             "id": self.device_id,
             "favorite": self.favorite,
             "data": {
                 "type": self.type_name,
                 "meta":
                     {
                         "settings": {
                             "bakingWindowDuration": self.baking_window_duration
                         },
                         "controllerMappings": {
                             "power": self.power,
                             "heartbeat": self.heart_beat,
                             "mpcReady": self.ready,
                             "errorWarning": self.error,
                             "siteID": self.site_id
                         },
                         "errorRule": self.error_rule,
                         "warningRule": self.warning_rule,
                         "addional_rules": self.addional_rules
                     },
             }}

        return d

    def get_data(self, start: int, end: int, agg: str = "avg", interval: str = "1m") -> pd.DataFrame:
        """get data for the model"""

        df = pd.DataFrame()
        v = self.power
        data = fetch_data_from_http(
            v, self.project_id, start, end, interval, agg=agg)
        df = append_data_to_dataframe_http(df, data, v)
        df = df.set_index("ts")

        return df

    def get_prediction_variable(self) -> str:
        """Return the name of the prediction variable

        :return: name of the prediction variable, e.g.: LM.123_123234_1234234.load
        :rtype: str
        """
        return "LM." + self.device_id.replace("-", "_") + ".load"

    def get_score(self, start: int, end: int) -> float:
        """Get the compliance score

        :param start: _description_
        :type start: int
        :param end: _description_
        :type end: int
        :return: _description_
        :rtype: float
        """

        # TODO this should be hardcoded
        buffer: int = 1

        try:
            df = self.get_data(start=start, end=end)
            df.columns = ['variable']
            v = self.get_prediction_variable()
            data = fetch_data_from_http(
                v, self.project_id, start, end, "1m")
            df = append_data_to_dataframe_http(df, data, v)
            df.rename(columns={v: 'load'}, inplace=True)

            operating_hours = load_project_operating_hours(self.project_id)

            holidays = load_project_holidays(self.project_id)

            def get_week_holiday_for_df(val):
                return get_week_holiday(self.project_id, val, holidays=holidays)

            # apply week day for timestamp
            apply_func = get_week_holiday_for_df if holidays is not None else get_weekday

            df['weekday'] = df['ts'].apply(apply_func)
            df['start_operating_hours'] = df['weekday'].apply(
                lambda x: operating_hours[x]['start'])

            df['end_operating_hours'] = df['weekday'].apply(
                lambda x: operating_hours[x]['end'])

            # Convert JSON time to datetime.time object
            df['start_time'] = df['start_operating_hours'].apply(lambda x: datetime.time(
                min(x['hours'] - buffer, 0), x['minutes'], x['seconds']))
            df['end_time'] = df['end_operating_hours'].apply(
                lambda x: datetime.time(max(x['hours'] + buffer, 23), x['minutes'], x['seconds']))

            # Lambda function to check if timestamp is between start and end times
            def check_time(
                row): return row['start_time'] <= row['ts'].time() <= row['end_time']

            # Apply the lambda function
            df['is_within_time'] = df.apply(check_time, axis=1)

            # is load in window
            df['load_in_window'] = df['is_within_time'] & df["load"]

            return df['load_in_window'].sum() / df["load"].sum()
        except Exception as e:
            logging.error(
                f'error occurred loadmonitor data holder score calculation score: {repr(e)}')
            return 0.0

    def get_report(self, start: int, end: int, buffer: int = 1) -> pd.DataFrame:
        """
        Generates a report of load monitor data for a specified time range.
        The returning dataframe contains the following columns:
        - 'date': The date of the load monitor data.
        - 'load_after_baking_window': Indicates if there is load after the baking window.
        - 'load_in_baking_window': Indicates if there is load within the baking window. 
            If true, the load has to be after the operating hour start time
        - 'load_before_baking_window': Indicates if there is load before the baking window.
        - 'load_operating_buffer_end': Indicates if there is load within the operating buffer end time.
        - 'load_operating_buffer_start': Indicates if there is load within the operating buffer start time.
        - 'load_baking_window_before_buffer_start': Indicates if there is load within the baking window 
        before the buffer start time.

        Args:
            start (int): The start timestamp of the time range.
            end (int): The end timestamp of the time range.
            buffer (int, optional): The buffer duration in hours. Defaults to 1.

        Returns:
            pd.DataFrame: A DataFrame containing the load monitor data grouped by day, with various load categories. 

        Raises:
            Exception: If an error occurs during report generation.

        """
        try:
            df = self.get_data(start=start, end=end, interval="15m")

            v = self.get_prediction_variable()
            data = fetch_data_from_http(
                v, self.project_id, start, end, "15m")
            df = append_data_to_dataframe_http(df, data, v)

            operating_hours = load_project_operating_hours(self.project_id)
            holidays = load_project_holidays(self.project_id)

            cached_holidays = get_holiday_range(project_id=self.project_id, from_date=datetime.datetime.fromtimestamp(
                start), to_date=datetime.datetime.fromtimestamp(end), holidays=holidays)

            def get_week_holiday_for_df(val, holidays=holidays, cached_holidays=cached_holidays):
                return get_week_holiday(self.project_id, val, holidays=holidays, cached_data=cached_holidays)

            apply_func = get_week_holiday_for_df if holidays is not None else get_weekday

            df['weekday'] = df['ts'].apply(apply_func)
            df['start_operating_hours'] = df['weekday'].apply(
                lambda x: operating_hours[x]['start'])
            df['end_operating_hours'] = df['weekday'].apply(
                lambda x: operating_hours[x]['end'])
            df.rename(columns={v: 'load'}, inplace=True)

            df_without_na = df.dropna().copy()

            baking_window = math.floor(
                int(self.baking_window_duration) / 60)  # convert to hours

            df_without_na['load_shifted'] = df_without_na['load'].shift(1)
            df_without_na['load_start'] = df_without_na.apply(
                lambda row: True if row['load'] == 1 and row['load_shifted'] == 0 else False, axis=1)

            # Convert JSON time to datetime.time object
            df_without_na['startbuffer_time'] = df_without_na['start_operating_hours'].apply(lambda x: datetime.time(
                max(x['hours'] - buffer, 0), x['minutes'], x['seconds']))
            df_without_na['start_baking_window_time'] = df_without_na['start_operating_hours'].apply(lambda x: datetime.time(
                max(x['hours'] - baking_window, 0), x['minutes'], x['seconds']))
            df_without_na['start_time'] = df_without_na['start_operating_hours'].apply(lambda x: datetime.time(
                max(x['hours'], 0), x['minutes'], x['seconds']))
            df_without_na['end_time'] = df_without_na['end_operating_hours'].apply(
                lambda x: datetime.time(min(x['hours'], 23), x['minutes'], x['seconds']))
            df_without_na['endbuffer_time'] = df_without_na['end_operating_hours'].apply(
                lambda x: datetime.time(min(x['hours'] - buffer, 23), x['minutes'], x['seconds']))

            # Lambda functions to check if load is in windows

            def check_baking_window(
                row): return row['start_baking_window_time'] <= row['ts'].time() <= row['start_time']

            def check_operatingbufferstart(
                row): return row['startbuffer_time'] <= row['ts'].time() <= row['start_time']

            def check_before_baking_window(
                row): return row['ts'].time() <= row['start_baking_window_time']

            def check_load_before_baking_window(
                row): return check_before_baking_window(row) and row["load"]

            def check_load_in_baking_window(
                row): return check_baking_window(row) and row["load"]

            def check_load_after_baking_window(
                row): return not check_baking_window(row) and not check_before_baking_window(row) and row["load"]

            def check_load_operating_buffer_end(
                row): return row['endbuffer_time'] <= row['ts'].time() <= row['end_time'] and row["load"]

            def check_load_start_operating_buffer_end(
                row): return row['endbuffer_time'] <= row['ts'].time() <= row['end_time'] and row["load_start"]

            def check_load_operating_buffer_start(
                row): return check_operatingbufferstart(row) and row["load"]

            def check_bakin_window_beforebufferstart(
                row): return not check_operatingbufferstart(row) and check_baking_window(row) and row["load"]

            # Apply the lambda functions
            df_without_na['load_in_baking_window'] = df_without_na.apply(
                check_load_in_baking_window, axis=1)
            df_without_na['load_before_baking_window'] = df_without_na.apply(
                check_load_before_baking_window, axis=1)
            df_without_na['load_after_baking_window'] = df_without_na.apply(
                check_load_after_baking_window, axis=1)
            df_without_na['load_operating_buffer_end'] = df_without_na.apply(
                check_load_operating_buffer_end, axis=1)
            df_without_na['load_start_operating_buffer_end'] = df_without_na.apply(
                check_load_start_operating_buffer_end, axis=1)
            df_without_na['load_operating_buffer_start'] = df_without_na.apply(
                check_load_operating_buffer_start, axis=1)
            df_without_na['load_baking_window_before_buffer_start'] = df_without_na.apply(
                check_bakin_window_beforebufferstart, axis=1)

            df_without_na['load_with_na'] = df_without_na['load'].replace(
                0, np.nan)
            df_without_na['load_with_na'] = df_without_na['load_with_na'].notna().astype(
                int)
            df_without_na['load_with_na'] = df_without_na['load_with_na'].replace(
                0, np.nan)
            # group by day
            df_grouped = df_without_na.groupby(df_without_na['ts'].dt.date).agg(
                load_after_baking_window=('load_after_baking_window', 'any'),
                load_in_baking_window=('load_in_baking_window', 'any'),
                load_before_baking_window=('load_before_baking_window', 'any'),
                load_operating_buffer_end=('load_operating_buffer_end', 'any'),
                load_operating_buffer_start=(
                    'load_operating_buffer_start', 'any'),
                load_baking_window_before_buffer_start=(
                    'load_baking_window_before_buffer_start', 'any'),
                load_start_operating_buffer_end=(
                    'load_start_operating_buffer_end', 'any'),
                first_load_start=(
                    'load_with_na', 'idxmax')
            ).reset_index()

            def convert_to_unix(time: bool) -> int:
                def conversion(x_internal: datetime.date | pd.NA):
                    if pd.isna(x_internal):
                        return np.nan
                    if not time:
                        return int(datetime.datetime(x_internal.year, x_internal.month, x_internal.day).timestamp())

                    return int(x_internal.timestamp())
                return conversion

            df_grouped['ts'] = df_grouped['ts'].apply(convert_to_unix(False))

            df_grouped['first_load_start'] = df_grouped['first_load_start'].apply(
                convert_to_unix(True))
            df_grouped = df_grouped.replace(np.nan, None)

            return df_grouped.to_dict("records")

        except Exception as e:
            logging.error(
                'error occurred loadmonitor data holder report gneration: %s, traceback: %s', repr(e), traceback.format_exc())

            return pd.DataFrame(columns=['date', 'load_after_baking_window', 'load_in_baking_window',
                                         'load_before_baking_window', 'load_operating_buffer_end',
                                         'load_operating_buffer_start',
                                         'load_baking_window_before_buffer_start',
                                         'load_start_operating_buffer_end']).to_dict("records")
