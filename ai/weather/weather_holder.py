from __future__ import annotations

from typing import Type

import pandas as pd
import psycopg.rows

from ai.utils.database_utils import DatabaseConnection
from ai.utils.mqtt_utils import get_device_to_cloud_mqtt_topic
from ai.utils.s3_utils import load_from_s3, get_ai_bucket_name, get_weather_holder_key, StoreMode, store_to_s3, \
    delete_from_s3


class WeatherHolder:
    def __init__(self, project_id: str, site_id: int, username: str, password: str, project_longitude: float,
                 project_latitude: float, site_longitude: float, site_latitude: float) -> None:
        """creates a new weather holder instance"""

        self._project_id = project_id
        self._site_id = site_id
        self._username = username
        self._password = password
        self._project_longitude = project_longitude
        self._project_latitude = project_latitude
        self._site_longitude = site_longitude
        self._site_latitude = site_latitude

    def get_project_id(self) -> str:
        """return the attribute"""

        return self._project_id

    def get_site_id(self) -> int:
        """return the attribute"""

        return self._site_id

    def get_username(self) -> str:
        """return the attribute"""

        return self._username

    def get_password(self) -> str:
        """return the attribute"""

        return self._password

    def get_project_longitude(self) -> float:
        """return the attribute"""

        return self._project_longitude

    def get_project_latitude(self) -> float:
        """return the attribute"""

        return self._project_latitude

    def get_site_longitude(self) -> float:
        """return the attribute"""

        return self._site_longitude

    def get_site_latitude(self) -> float:
        """return the attribute"""

        return self._site_latitude

    @classmethod
    def from_db_row(cls, row: psycopg.rows.Row) -> WeatherHolder:
        """creates a new weather holder instance from a database table row"""

        return cls(project_id=str(row[0]), site_id=row[1], project_longitude=row[2], project_latitude=row[3],
                   site_longitude=row[4], site_latitude=row[5], username=str(row[6]), password=str(row[7]))

    def to_db(self) -> None:
        """saves the current weather holder instance to the database"""

        with DatabaseConnection.get_connection() as conn:
            with conn.cursor() as cur:
                insert_query = "INSERT into stations(project_id, site_id, project_longitude, project_latitude, " \
                               "site_longitude, site_latitude, username, password) VALUES (%s, %s, %s, %s, %s, %s, " \
                               "%s, %s) "
                cur.execute(insert_query, (self._project_id, self._site_id,
                                           self._project_longitude, self._project_latitude,
                                           self._site_longitude, self._site_latitude,
                                           self._username, self._password))
                conn.commit()

    def to_dict(self) -> dict[str, object]:
        """creates a dict representation of the current weather holder instance"""

        return {"project_id": self._project_id,
                "site_id": self._site_id,
                "username": self._username,
                "password": self._password,
                "project_longitude": self._project_longitude,
                "project_latitude": self._project_latitude,
                "site_longitude": self._site_longitude,
                "site_latitude": self._site_latitude}

    def get_weather_measurements(self, val: pd.Series) -> list[dict[str, object]]:
        """creates an MQTT publishable dict that contains weather data"""

        topic = get_device_to_cloud_mqtt_topic(self._project_id)
        project_id = self._project_id.replace("-", "_")
        measurements = [
            [{"n": f"weather.{project_id}.tt",
              "v": float(val.temperature_forecast)}],
            [{"n": f"weather.{project_id}.gh",
              "v": float(val.solar_radiation_forecast)}],
            [{"n": f"weather.{project_id}.dr",
              "v": float(val.diffuse_radiation_forecast)}],
            [{"n": f"weather.{project_id}.gi",
              "v": float(val.inclined_radiation_forecast)}],
            [{"n": f"weather.{project_id}.nr",
              "v": float(val.normal_radiation_forecast)}]
        ]

        return [{"topic": topic,
                 "values": measurements}]

    def is_instance_of(self, type_arg: Type[object] | tuple[Type[object], ...]) -> bool:
        """check if the object is an instance of the passed class(es)"""

        return isinstance(self, type_arg)

    @staticmethod
    def load_weather_holder_from_s3(project_id: str) -> WeatherHolder:
        """load weather holder from S3"""

        weather_holder = load_from_s3(get_ai_bucket_name(), get_weather_holder_key(project_id))
        if isinstance(weather_holder, WeatherHolder):
            return weather_holder
        else:
            raise ValueError()

    @staticmethod
    def store_weather_holder_to_s3(weather_holder: WeatherHolder,
                                   store_mode: StoreMode = StoreMode.ONLY_UPDATE) -> None:
        """store weather holder to S3"""

        store_to_s3(get_ai_bucket_name(), get_weather_holder_key(weather_holder.get_project_id()),
                    weather_holder, store_mode)

    @staticmethod
    def delete_weather_holder_from_s3(project_id: str) -> None:
        """delete weather holder from S3"""

        delete_from_s3(get_ai_bucket_name(), get_weather_holder_key(project_id))
