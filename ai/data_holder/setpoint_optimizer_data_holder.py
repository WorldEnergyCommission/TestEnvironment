from __future__ import annotations

import pandas as pd

from ai.interface.data_holder import DataHolder
from ai.utils.http_utils import fetch_data_from_http, append_data_to_dataframe_http
from ai.utils.temperature_control_system_utils import TemperatureControlSystem, AirTemperatureControlSystem


class SetpointOptimizerDataHolder(DataHolder):
    def __init__(
            self, device_id: str, project_id: str, collection_id: str, start: int, site_id: int, ready: str, error: str,
            heart_beat: str, username: str, password: str, favorite: bool, name: str, created_at: str, error_rule: str,
            warning_rule: str, algorithm_model: str, algorithm_additional_processors: str,
            heating_water_systems: list[TemperatureControlSystem],
            heating_air_systems: list[AirTemperatureControlSystem],
            cooling_air_systems: list[AirTemperatureControlSystem],
            cooling_water_systems: list[TemperatureControlSystem],
            hybrid_water_systems: list[TemperatureControlSystem],
            hybrid_air_systems: list[AirTemperatureControlSystem],
            type_name: str = "SetpointOptimizer") -> None:
        """creates the setpoint optimizer data holder class, which contains static information which is needed to train
        and deploy the model

        :param device_id: unique identifier for the dataholder and the corresponding model
        :param project_id: unique identifier for the project in which the dataholder and the model were created
        :param type_name: the model type of the corresponding model
        :param collection_id: unique identifier for collection in which
            the dataholder and the model were created
        :param start: indicates the starting date for the model training
        :param site_id: unique identifier for the connected weather site
        :param ready: output variable, to which the model writes its current state, 0 means its not yet trained,
            1 means it has been trained and is ready
        :param error: output variable to which the model writes in case of an error or a warning,
            0 means no error or warnings, 1 means there is a warning, 2 means there is a error
        :param heart_beat: output variable for the model for the periodic heartbeat
        :param username: mqtt username
        :param password: mqtt password
        :param favorite: indicates whether the model has been set as favorite or not
        :param name: name of the model
        :param created_at: timestamp of when the model was created
        :param error_rule: error rule to send alerts when a error happens
        :param warning_rule: warning rule to send alerts when a error happens
        :param heating_water_systems: list of heating water system that will be controlled
        :param cooling_water_systems: list of cooling water system that will be controlled
        :param hybrid_water_systems: list of hybrid water system that will be controlled
        :param hybrid_air_systems: list of hybrid air system that will be controlled
        :param heating_air_systems: list of heating air system that will be controlled
        :param cooling_air_systems: list of cooling water system that will be controlled
        :param algorithm_model: model of the spo
        :param algorithm_additional_processors: additional processes of the spo
        """

        super().__init__(device_id, project_id, type_name, collection_id, start, site_id, ready, error, heart_beat,
                         username, password, favorite, name, created_at, error_rule, warning_rule)

        project_id_placeholder = project_id.replace("-", "_")
        
        self.algorithm_model = algorithm_model
        self.algorithm_additional_processors = algorithm_additional_processors

        self.outdoor_temperature = "weather." + project_id_placeholder + ".tt"
        self.horizontal_radiation = "weather." + project_id_placeholder + ".gh"
        self.diffuse_radiation = "weather." + project_id_placeholder + ".dr"
        self.inclined_radiation = "weather." + project_id_placeholder + ".gi"
        self.normal_radiation = "weather." + project_id_placeholder + ".nr"

        self.heating_water_systems = heating_water_systems
        self.heating_air_systems = heating_air_systems
        self.cooling_water_systems = cooling_water_systems
        self.cooling_air_systems = cooling_air_systems
        self.hybrid_water_systems = hybrid_water_systems
        self.hybrid_air_systems = hybrid_air_systems

    @classmethod
    def from_dict(cls, d: dict[str, ...]) -> SetpointOptimizerDataHolder:
        """create a setpoint optimizer instance from a dictionary"""

        controller_mappings: dict = d["data"]["meta"]["controllerMappings"]
        
        algorithm_model = controller_mappings.get("algorithmModel")
        algorithm_additional_processors = controller_mappings.get("algorithmAdditionalProcessors")

        heating_water_systems = []
        heating_air_systems = []
        cooling_water_systems = []
        cooling_air_systems = []
        hybrid_water_systems = []
        hybrid_air_systems = []

        for k, c in controller_mappings["heating_water_systems"]["components"].items():
            c["identifier"] = k
            heating_water_systems.append(
                TemperatureControlSystem.from_dict(c, "heating_water_system"))

        for k, c in controller_mappings["heating_air_systems"]["components"].items():
            c["identifier"] = k
            heating_air_systems.append(
                AirTemperatureControlSystem.from_dict(c, "heating_air_system"))

        for k, c in controller_mappings["cooling_water_systems"]["components"].items():
            c["identifier"] = k
            cooling_water_systems.append(
                TemperatureControlSystem.from_dict(c, "cooling_water_system"))

        for k, c in controller_mappings["cooling_air_systems"]["components"].items():
            c["identifier"] = k
            cooling_air_systems.append(
                AirTemperatureControlSystem.from_dict(c, "cooling_air_system"))

        for k, c in controller_mappings["hybrid_water_systems"]["components"].items():
            c["identifier"] = k
            hybrid_water_systems.append(
                TemperatureControlSystem.from_dict(c, "hybrid_water_system"))

        for k, c in controller_mappings["hybrid_air_systems"]["components"].items():
            c["identifier"] = k
            hybrid_air_systems.append(
                AirTemperatureControlSystem.from_dict(c, "hybrid_air_system"))

        return cls(project_id=d["project_id"], device_id=d["id"], collection_id=d["collection_id"],
                   heart_beat=controller_mappings["heartbeat"], algorithm_model=algorithm_model,
                   algorithm_additional_processors=algorithm_additional_processors, ready=controller_mappings["mpcReady"],
                   error=controller_mappings["errorWarning"], name=d["name"], created_at=d["created_at"],
                   favorite=d["favorite"], error_rule=d["data"]["meta"]["errorRule"],
                   warning_rule=d["data"]["meta"]["warningRule"], site_id=d["data"]["meta"]["site_id"],
                   username=d["data"]["meta"]["username"], password=d["data"]["meta"]["password"],
                   start=controller_mappings["startDate"], heating_air_systems=heating_air_systems,
                   heating_water_systems=heating_water_systems, cooling_water_systems=cooling_water_systems,
                   cooling_air_systems=cooling_air_systems, hybrid_air_systems=hybrid_air_systems,
                   hybrid_water_systems=hybrid_water_systems)

    def to_dict(self) -> dict[str, ...]:
        """create a dictionary from the instance"""

        return {"collection_id": self.collection_id,
                "project_id": self.project_id,
                "created_at": self.created_at,
                "name": self.name,
                "id": self.device_id,
                "favorite": self.favorite,
                "data": {
                    "type": self.type_name,
                    "meta":
                        {
                            "controllerMappings": {
                                "heating_air_systems": {
                                    "components": {c.identifier: c.to_dict() for c in self.heating_air_systems},
                                    "count": len(self.heating_air_systems)
                                },
                                "heating_water_systems": {
                                    "components": {c.identifier: c.to_dict() for c in self.heating_water_systems},
                                    "count": len(self.heating_water_systems)
                                },
                                "cooling_air_systems": {
                                    "components": {c.identifier: c.to_dict() for c in self.cooling_air_systems},
                                    "count": len(self.cooling_air_systems)
                                },
                                "cooling_water_systems": {
                                    "components": {c.identifier: c.to_dict() for c in self.cooling_water_systems},
                                    "count": len(self.cooling_water_systems)
                                },
                                "hybrid_air_systems": {
                                    "components": {c.identifier: c.to_dict() for c in self.hybrid_air_systems},
                                    "count": len(self.hybrid_air_systems)
                                },
                                "hybrid_water_systems": {
                                    "components": {c.identifier: c.to_dict() for c in self.hybrid_water_systems},
                                    "count": len(self.hybrid_water_systems)
                                },
                                "heartbeat": self.heart_beat,
                                "mpcReady": self.ready,
                                "errorWarning": self.error,
                                "startDate": self.start,
                                "siteID": self.site_id,
                                "algorithmModel": self.algorithm_model,
                                "algorithmAdditionalProcessors": self.algorithm_additional_processors,
                            },
                            "errorRule": self.error_rule,
                            "warningRule": self.warning_rule,
                        },
                }}

    def set_schedule(self, identifier: str, params: dict[str, bool | dict[str, dict[str, float]]]) -> None:
        """set the schedule from the parameters in the corresponding system"""

        system_type = identifier.split("_")
        system_type = "_".join(system_type[:2])
        d = {
            "heating_water": self.heating_water_systems,
            "heating_air": self.heating_air_systems,
            "cooling_air": self.cooling_air_systems,
            "cooling_water": self.cooling_water_systems,
            "hybrid_air": self.hybrid_air_systems,
            "hybrid_water": self.hybrid_water_systems
        }

        for system in d[system_type]:
            if system.identifier == identifier:
                system.weekly_schedule = params["weekly_schedule"]
                system.weekly_schedule_active = params["weekly_schedule_active"]

    def get_data(self, start: int, end: int, agg: str = "last", prediction: bool = False) -> pd.DataFrame:
        """data interface for the time series data

        :param start: start date of the requested data
        :param end: end date of the requested data
        :param agg: aggregation type of the requested data
        :param prediction: if the data is received during training, weather forecast is not needed,
            if it is fetched during deployment the weather forecast needs to be added to the dataframe

        :return: dataframe containing room_temperatures, flow_temperatures, return_temperature
            and weather data
        """

        df = pd.DataFrame()
        for sys in [self.heating_water_systems, self.heating_air_systems,
                    self.cooling_water_systems, self.cooling_air_systems,
                    self.hybrid_water_systems, self.hybrid_air_systems]:
            for c in sys:
                if df.empty:
                    df = c.get_data(start, end, self.project_id)
                else:
                    df = pd.merge(df, c.get_data(
                        start, end, self.project_id), on="ts")

        data = fetch_data_from_http(
            self.outdoor_temperature, self.project_id, start, end, sample_time="1m", agg=agg)
        horizontal_radiation = fetch_data_from_http(
            self.horizontal_radiation, self.project_id, start, end, sample_time="1m", agg=agg)

        df = append_data_to_dataframe_http(df, data, "outdoor_temperature")
        df = append_data_to_dataframe_http(
            df, horizontal_radiation, "horizontal_radiation")

        df = df.set_index("ts")

        if prediction:
            forecast = self.get_weather_forecast(
                labels_to_drop=["horizontal_radiation", "diffuse_radiation", "inclined_radiation", "normal_radiation"])
            forecast = forecast[forecast.index > df.index[-1]]
            df = pd.concat([df, forecast])

        return df

    def is_setpoint_optimizer_next_generation(self) -> bool:
        """check if the setpoint optimizer is next generation"""

        return '_NG' in self.name

    def is_setpoint_optimizer_top(self) -> bool:
        """check if the setpoint optimizer the top room temperatures"""

        return '_TOP' in self.name
