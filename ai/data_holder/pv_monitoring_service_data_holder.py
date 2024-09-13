from __future__ import annotations

import pandas as pd

from ai.interface.data_holder import DataHolder


class PvMonitoringServiceDataHolder(DataHolder):
    def __init__(self, device_id: str, project_id: str, collection_id: str, start: int, site_id: int, ready: str,
                 error: str, heart_beat: str, username: str, password: str, favorite: bool, name: str, created_at: str,
                 error_rule: str, warning_rule: str, power: str, efficiency: str, end: int, model_type: int,
                 type_name: str = "PVMonitoringService") -> None:
        """creates the pv monitoring service data holder class, which contains static information which is needed to
        train and deploy the model

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
        :param error_rule: error rule to send alerts when an error happens
        :param warning_rule: warning rule to send alerts when a error happens
        :param power: input variable that holds the power data of the PV-plant
        :param efficiency: output variable to which the model writes its prediction for the plant efficiency
        :param end: indicates the end date for the reference time window
        :param model_type: identifies which monitoring model will be used
        """

        super().__init__(device_id, project_id, type_name, collection_id, start, site_id, ready, error, heart_beat,
                         username, password, favorite, name, created_at, error_rule, warning_rule)

        self.power = power
        self.efficiency = efficiency
        self.end = end
        self.model_type = model_type

        project_id_placeholder = project_id.replace("-", "_")

        self.outdoor_temperature = "weather." + project_id_placeholder + ".tt"
        self.horizontal_radiation = "weather." + project_id_placeholder + ".gh"
        self.diffuse_radiation = "weather." + project_id_placeholder + ".dr"
        self.inclined_radiation = "weather." + project_id_placeholder + ".gi"
        self.normal_radiation = "weather." + project_id_placeholder + ".nr"
        self.decay = "PV." + self.device_id.replace("-", "_") + ".decay"

    @classmethod
    def from_dict(cls, d: dict[str, ...]) -> PvMonitoringServiceDataHolder:
        """create an instance from a dictionary"""

        controller_mappings = d["data"]["meta"]["controllerMappings"]

        if "model_type" not in controller_mappings.keys():
            model_type = 0
        else:
            model_type = controller_mappings["model_type"]

        return cls(project_id=d["project_id"], device_id=d["id"], collection_id=d["collection_id"],
                   power=d["data"]["meta"]["controllerMappings"]["power"],
                   heart_beat=controller_mappings["heartbeat"], ready=controller_mappings["mpcReady"],
                   error=controller_mappings["errorWarning"], name=d["name"], created_at=d["created_at"],
                   favorite=d["favorite"], error_rule=d["data"]["meta"]["errorRule"],
                   warning_rule=d["data"]["meta"]["warningRule"], site_id=d["data"]["meta"]["site_id"],
                   username=d["data"]["meta"]["username"], password=d["data"]["meta"]["password"],
                   start=controller_mappings["startDate"], end=controller_mappings["endDate"],
                   efficiency=controller_mappings["efficiency"], model_type=model_type)

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
                                "power": self.power,
                                "heartbeat": self.heart_beat,
                                "mpcReady": self.ready,
                                "errorWarning": self.error,
                                "startDate": self.start,
                                "endDate": self.end,
                                "siteID": self.site_id,
                                "efficiency": self.efficiency,
                                "model_type": self.model_type
                            },
                            "errorRule": self.error_rule,
                            "warningRule": self.warning_rule
                        },
                }}

    def get_data(self, start: int, end: int, agg: str = "avg") -> pd.DataFrame:
        """data interface for the time series data

        :param start: start date of the requested data
        :param end: end date of the requested data
        :param agg: aggregation type of the requested data

        :return: dataframe with following columns: ["power", "outdoor_temperature",
            "horizontal_radiation", "diffuse_radiation", "inclined_radiation", "normal_radiation"] including
            a timestamp index
        """

        df = self._get_data(["power", "outdoor_temperature", "horizontal_radiation",
                             "diffuse_radiation", "inclined_radiation", "normal_radiation"], start, end)
        df = df.set_index("ts")
        return df
