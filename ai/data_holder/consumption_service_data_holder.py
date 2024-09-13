from __future__ import annotations

import pandas as pd

from ai.interface.data_holder import DataHolder


class ConsumptionServiceDataHolder(DataHolder):
    def __init__(self, device_id: str, collection_id: str, project_id: str, start: int, power: str,
                 predicted_power: str, predicted_energy: str, heart_beat: str, error: str, ready: str, name: str,
                 created_at: str, favorite: bool, error_rule: str, warning_rule: str, site_id: int, username: str,
                 password: str, chart_scaling: str, type_name: str = "ConsumptionService", data_type: int = 0,
                 model_type: int = 0) -> None:
        """creates the consumption service data holder class, which contains static information which is needed
        to train and deploy the model"""

        self.power = power

        self.predicted_power = predicted_power
        self.predicted_energy = predicted_energy
        self.data_type = data_type

        project_id_placeholder = project_id.replace("-", "_")

        # weather data variables are not created by the user, they have a generic structure
        if data_type != 1:
            self.outdoor_temperature = "weather." + project_id_placeholder + ".tt"
            self.horizontal_radiation = "weather." + project_id_placeholder + ".gh"
            self.diffuse_radiation = "weather." + project_id_placeholder + ".dr"
            self.inclined_radiation = "weather." + project_id_placeholder + ".gi"
            self.normal_radiation = "weather." + project_id_placeholder + ".nr"
        else:
            self.outdoor_temperature = "weather." + project_id_placeholder + ".ttp"
            self.horizontal_radiation = "weather." + project_id_placeholder + ".ghp"
            self.diffuse_radiation = "weather." + project_id_placeholder + ".drp"
            self.inclined_radiation = "weather." + project_id_placeholder + ".gip"
            self.normal_radiation = "weather." + project_id_placeholder + ".nrp"

        self.chart_scaling = chart_scaling
        self.model_type = model_type
        super().__init__(device_id=device_id, project_id=project_id, collection_id=collection_id,
                         start=start, site_id=site_id, ready=ready, error=error, heart_beat=heart_beat,
                         username=username, password=password, favorite=favorite, name=name, created_at=created_at,
                         error_rule=error_rule, warning_rule=warning_rule, type_name=type_name)

    @classmethod
    def from_dict(cls, d: dict[str, ...]) -> ConsumptionServiceDataHolder:
        """creates a new instance from a dictionary"""

        controller_mappings = d["data"]["meta"]["controllerMappings"]

        if "data_type" not in d["data"]["meta"].keys():
            d["data"]["meta"]["data_type"] = 0

        if "model_type" not in d["data"]["meta"].keys():
            d["data"]["meta"]["model_type"] = 0

        return cls(project_id=d["project_id"], device_id=d["id"], collection_id=d["collection_id"],
                   power=d["data"]["meta"]["controllerMappings"]["power"],
                   predicted_power=controller_mappings["predictedPower"],
                   predicted_energy=controller_mappings["predictedEnergy"],
                   heart_beat=controller_mappings["heartbeat"], ready=controller_mappings["mpcReady"],
                   error=controller_mappings["errorWarning"], name=d["name"], created_at=d["created_at"],
                   favorite=d["favorite"], error_rule=d["data"]["meta"]["errorRule"],
                   warning_rule=d["data"]["meta"]["warningRule"], site_id=d["data"]["meta"]["site_id"],
                   username=d["data"]["meta"]["username"], password=d["data"]["meta"]["password"],
                   start=controller_mappings["startDate"], chart_scaling=d["data"]["meta"]["chartScaling"],
                   data_type=d["data"]["meta"]["data_type"], model_type=d["data"]["meta"]["model_type"])

    def to_dict(self) -> dict[str, ...]:
        """convert the instance into a dictionary"""

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
                            "model_type": self.model_type,
                            "chartScaling": self.chart_scaling,
                            "controllerMappings": {
                                "power": self.power,
                                "predictedPower": self.predicted_power,
                                "predictedEnergy": self.predicted_energy,
                                "heartbeat": self.heart_beat,
                                "mpcReady": self.ready,
                                "errorWarning": self.error,
                                "startDate": self.start,
                                "siteID": self.site_id
                            },
                            "errorRule": self.error_rule,
                            "warningRule": self.warning_rule,
                            "data_type": self.data_type
                        },
                }}

    def get_data(self, start: int, end: int, prediction: bool = False) -> pd.DataFrame:
        """get data for the model"""

        df = self._get_data(["power", "outdoor_temperature", "horizontal_radiation",
                             "diffuse_radiation", "inclined_radiation", "normal_radiation"], start, end)

        df = df.set_index("ts")
        if prediction:
            df = pd.concat([df, self.get_weather_forecast()])
        return df
