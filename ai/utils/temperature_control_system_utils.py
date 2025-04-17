from __future__ import annotations

import logging
import traceback

import pandas as pd

from ai.utils.http_utils import (append_data_to_dataframe_http,
                                 fetch_data_from_http)


class TemperatureControlSystem:
    def __init__(self, flow_temperature: str, return_temperature: str, room_temperatures: dict[str, dict[str, str]],
                 status: str, optimized_flow_temperature: str, advanced_curve_settings: bool, name: str, type_name: str, identifier: str,
                 max_flow_temperature: float | dict[str, float] = 65,
                 min_flow_temperature: float | dict[str, float] = 42,
                 set_point_temperature: float | dict[str, float] = 20,
                 on_off_state: str = "",
                 timezone: str = None, weekly_schedule: dict[str, dict[str, str | float]] = None,
                 weekly_schedule_active: bool = False,
                 y1_y_range: dict[str, int] = {
                     "upper": 60, "lower": 25},
                 y2_y_range: dict[str, int] = {"upper": 60, "lower": 25},
                 x_range: dict[str, int] = {"left": -15, "right": 15},
                 y1_y2_diff: int = -5) -> None:
        """creates the temperature control system instance"""

        self.advanced_curve_settings = advanced_curve_settings
        self.flow_temperature = flow_temperature
        self.return_temperature = return_temperature
        self.room_temperatures = room_temperatures
        self.status = status
        self.optimized_flow_temperature = optimized_flow_temperature
        self.name = name
        self.type_name = type_name
        self.identifier = identifier
        self.max_flow_temperature = max_flow_temperature
        self.min_flow_temperature = min_flow_temperature
        self.set_point_temperature = set_point_temperature

        self.weekly_schedule = weekly_schedule
        self.weekly_schedule_active = weekly_schedule_active

        self.timezone = timezone
        self.on_off_state = on_off_state

        self.y1_y_range = y1_y_range
        self.y2_y_range = y2_y_range
        self.x_range = x_range
        self.y1_y2_diff = y1_y2_diff

    @staticmethod
    def get_room_temperatures(
            d: dict[str, object]) -> dict[str, dict[str, str]]:
        """get the room temperatures from the dictionary"""

        passed_room_temperatures = d["room_temperatures"]
        parsed_room_temperatures = {}
        if isinstance(passed_room_temperatures, dict):
            for key, value in passed_room_temperatures.items():
                if isinstance(key, str) and isinstance(value, dict):
                    if 'title' in value and isinstance(value['title'], str) and \
                            'variable' in value and isinstance(value['variable'], str):
                        parsed_room_temperatures[key] = {'title': value['title'], 'variable': value['variable']}
                    else:
                        return {}
                else:
                    return {}
            return parsed_room_temperatures
        else:
            return {}

    @staticmethod
    def get_temperatures_from_dict(
            d: dict[str, object]) -> tuple[float | dict[str, float],
                                           float | dict[str, float],
                                           float | dict[str, float]]:
        """get important temperatures from dictionary"""

        max_flow_temperature = d.get("max_flow_temperature", 65)
        min_flow_temperature = d.get("min_flow_temperature", 42)
        set_point_temperature = d.get("set_point_temperature", 20)

        return max_flow_temperature, min_flow_temperature, set_point_temperature

    @staticmethod
    def get_heating_curve_limits_from_dict(
            d: dict[str, object]) -> tuple[dict[str, int],
                                           dict[str, int],
                                           dict[str, int],
                                           int]:
        """get important limits for the heating curve configuration"""

        y1_y_range = d.get("y1_y_range", {"upper": 60, "lower": 25})
        y2_y_range = d.get("y2_y_range", {"upper": 60, "lower": 25})
        x_range = d.get("x_range", {"left": -15, "right": 15})
        y1_y2_diff = d.get("y1_y2_diff", -5)

        return y1_y_range, y2_y_range, x_range, y1_y2_diff

    @classmethod
    def from_dict(cls, d: dict[str, object], type_name: str) -> TemperatureControlSystem:
        """creates an instance from a dictionary"""

        max_flow_temperature, min_flow_temperature, set_point_temperature = cls.get_temperatures_from_dict(d)
        y1_y_range, y2_y_range, x_range, y1_y2_diff = cls.get_heating_curve_limits_from_dict(
            d)

        on_off_state = d.get("on_off_state", "")
        timezone = d.get("timezone", "Europe/Vienna")
        weekly_schedule = d.get("weekly_schedule", {})
        weekly_schedule_active = d.get("weekly_schedule_active", False)
        advanced_curve_settings = d.get("advanced_curve_settings", False)

        return cls(flow_temperature=str(d["flow_temperature"]),advanced_curve_settings=advanced_curve_settings,
                   return_temperature=str(d["return_temperature"]), room_temperatures=cls.get_room_temperatures(d),
                   status=str(d["status"]), optimized_flow_temperature=str(d["optimized_flow_temperature"]),
                   name=str(d["name"]),
                   type_name=type_name, max_flow_temperature=max_flow_temperature,
                   min_flow_temperature=min_flow_temperature,
                   set_point_temperature=set_point_temperature,
                   identifier=str(d["identifier"]), on_off_state=on_off_state, weekly_schedule=weekly_schedule,
                   weekly_schedule_active=weekly_schedule_active, timezone=timezone,
                   y1_y_range=y1_y_range, y2_y_range=y2_y_range, x_range=x_range, y1_y2_diff=y1_y2_diff)

    def to_dict(self) -> dict[str, object]:
        """converts the object to a dictionary"""

        return {"flow_temperature": self.flow_temperature,
                "advanced_curve_settings": self.advanced_curve_settings,
                "return_temperature": self.return_temperature,
                "room_temperatures": self.room_temperatures,
                "status": self.status,
                "optimized_flow_temperature": self.optimized_flow_temperature,
                "name": self.name,
                "type": self.type_name,
                "max_flow_temperature": self.max_flow_temperature,
                "min_flow_temperature": self.min_flow_temperature,
                "set_point_temperature": self.set_point_temperature,
                "on_off_state": self.on_off_state,
                "timezone": self.timezone,
                "weekly_schedule": self.weekly_schedule,
                "weekly_schedule_active": self.weekly_schedule_active,
                "y1_y_range": self.y1_y_range,
                "y2_y_range": self.y2_y_range,
                "x_range": self.x_range,  # locations of y1 and y2 on y axis
                "y1_y2_diff": self.y1_y2_diff  # min diff between y1y and Y2y
                }

    def get_data(self, start: int, end: int, project_id: str, sample_rate: str = "1m",
                 agg: str = "last", var: list[str] = None) -> pd.DataFrame:
        """retrieves data for the temperature control system"""

        if var is None:
            var = ["flow_temperature", "return_temperature",
                   "room_temperatures", "status"]
        df = pd.DataFrame()

        for attr, value in self.__dict__.items():
            if attr in var:
                if value == "":
                    continue
                if attr == "room_temperatures":
                    i = 1
                    for _, rt in value.items():
                        try:
                            data = fetch_data_from_http(
                                rt["variable"], project_id, start, end, sample_rate, agg=agg, last_value_fill=True)
                        except Exception as e:
                            logging.debug("debugging")
                            logging.debug(traceback.format_exc())
                            logging.debug(value)
                            logging.debug(attr)
                            logging.debug(rt)
                            logging.debug(e)
                            continue
                        df = append_data_to_dataframe_http(
                            df, data, self.identifier + "_" + attr + str(i))
                        i += 1
                else:
                    data = fetch_data_from_http(
                        value, project_id, start, end, sample_rate, agg=agg, last_value_fill=True)
                    df = append_data_to_dataframe_http(
                        df, data, self.identifier + "_" + attr)
        return df


class AirTemperatureControlSystem(TemperatureControlSystem):
    def __init__(self, flow_temperature: str, advanced_curve_settings: bool, return_temperature: str, room_temperatures: dict[str, dict[str, str]],
                 status: str, optimized_flow_temperature: str, name: str, type_name: str, identifier: str,
                 in_out_flow_temperature: str, out_in_flow_temperature: str,
                 max_flow_temperature: float | dict[str, float] = 55,
                 min_flow_temperature: float | dict[str, float] = 42,
                 set_point_temperature: float | dict[str, float] = 20,
                 timezone: str = None,
                 weekly_schedule: dict[str, dict[str, float]] = None, weekly_schedule_active: bool = False,
                 y1_y_range: dict[str, int] = {
                     "upper": 60, "lower": 25},
                 y2_y_range: dict[str, int] = {"upper": 60, "lower": 25},
                 x_range: dict[str, int] = {"left": -15, "right": 15},
                 y1_y2_diff: int = -5) -> None:
        """creates the air temperature control system instance"""

        super().__init__(flow_temperature, return_temperature, room_temperatures, status,
                         optimized_flow_temperature, advanced_curve_settings, name, type_name, identifier,
                         max_flow_temperature=max_flow_temperature,
                         min_flow_temperature=min_flow_temperature, set_point_temperature=set_point_temperature,
                         timezone=timezone, weekly_schedule=weekly_schedule,
                         weekly_schedule_active=weekly_schedule_active,
                         y1_y_range=y1_y_range, y2_y_range=y2_y_range, x_range=x_range, y1_y2_diff=y1_y2_diff)

        self.in_out_flow_temperature = in_out_flow_temperature
        self.out_in_flow_temperature = out_in_flow_temperature

    @classmethod
    def from_dict(cls, d: dict[str, object], type_name: str) -> AirTemperatureControlSystem:
        """creates an instance from a dictionary"""

        max_flow_temperature, min_flow_temperature, set_point_temperature = cls.get_temperatures_from_dict(d)

        y1_y_range, y2_y_range, x_range, y1_y2_diff = cls.get_heating_curve_limits_from_dict(
            d)

        timezone = d.get("timezone", "Europe/Vienna")
        weekly_schedule = d.get("weekly_schedule", {})
        weekly_schedule_active = d.get("weekly_schedule_active", False)
        advanced_curve_settings = d.get("advanced_curve_settings", False)

        return cls(flow_temperature=str(d["flow_temperature"]), advanced_curve_settings=advanced_curve_settings,
                   return_temperature=str(d["return_temperature"]), room_temperatures=cls.get_room_temperatures(d),
                   status=str(d["status"]), optimized_flow_temperature=str(d["optimized_flow_temperature"]),
                   name=str(d["name"]),
                   type_name=type_name, max_flow_temperature=max_flow_temperature,
                   min_flow_temperature=min_flow_temperature, set_point_temperature=set_point_temperature,
                   in_out_flow_temperature=str(d["in_out_flow_temperature"]),
                   out_in_flow_temperature=str(d["out_in_flow_temperature"]), identifier=str(d["identifier"]),
                   timezone=timezone,
                   weekly_schedule=weekly_schedule, weekly_schedule_active=weekly_schedule_active,
                   y1_y_range=y1_y_range, y2_y_range=y2_y_range, x_range=x_range, y1_y2_diff=y1_y2_diff)

    def to_dict(self) -> dict[str, object]:
        """converts the object to a dictionary"""

        d = super().to_dict()
        d["in_out_flow_temperature"] = self.in_out_flow_temperature
        d["out_in_flow_temperature"] = self.out_in_flow_temperature
        return d

    def get_data(self, start: int, end: int, project_id: str, sample_rate: str = "1m",
                 agg: str = "last", var: list[str] = None) -> pd.DataFrame:
        """retrieves data for the air temperature control system"""

        if var is None:
            var = ["flow_temperature", "return_temperature", "room_temperatures",
                   "in_out_flow_temperature", "out_in_flow_temperature", "status"]
        return super().get_data(start, end, project_id, sample_rate, agg, var)
