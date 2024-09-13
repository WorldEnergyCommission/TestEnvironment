from __future__ import annotations

import pandas as pd
import math

from ai.interface.data_holder import DataHolder
from ai.utils.chart_option_utils import ChartOption
from ai.utils.http_utils import fetch_data_from_http, append_data_to_dataframe_http


class HistoryAnomalyDetectionDataHolder(DataHolder):
    def __init__(self, device_id: str, collection_id: str, project_id: str, heart_beat: str, error: str,
                 ready: str, name: str, created_at: str, favorite: bool, error_rule: str, warning_rule: str,
                 anomaly_score: str, chart_options: list[ChartOption], site_id: int, username: str, password: str,
                 start: int, end: int, width: str, threshold: float, type_name: str = "HistoryAnomalyDetection"):
        """creates the history anomaly detection data holder class, which contains static information which is needed
        to train and deploy the model

        :param device_id: unique identifier for the dataholder and the corresponding model
        :param project_id: unique identifier for the project in which
            the dataholder and the model were created
        :param type_name: the model type of the corresponding model
        :param collection_id: unique identifier for collection in which
            the dataholder and the model were created
        :param site_id: unique identifier for the connected weather site
        :param ready: output variable, to which the model writes its current state,
            0 means its not yet trained, 1 means it has been trained and is ready
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
        :param chart_options: input variables which will be monitored
        :param width: holds information about the width of the chart
        :param threshold: threshold which dictates when a anomaly gets detected
        :param anomaly_score: output variable to which the model writes the calculated anomaly score,
        :param start: timestamp of the start date for the referenced time window
        :param end: timestamp of the end date for the referenced time window
        """

        self.chart_options = chart_options
        self.width = width
        self.threshold = threshold

        self.variables = []
        for v in chart_options:
            if v.name == "Anomaly Score":
                continue
            self.variables.append(v.var)

        self.anomaly_score = anomaly_score
        super().__init__(device_id=device_id, project_id=project_id, collection_id=collection_id,
                         start=None, site_id=site_id, ready=ready, error=error, heart_beat=heart_beat,
                         username=username, password=password, favorite=favorite, name=name, created_at=created_at,
                         error_rule=error_rule, warning_rule=warning_rule, type_name=type_name)
        self.start = start
        self.end = end

    @classmethod
    def from_dict(cls, d: dict[str, ...]) -> HistoryAnomalyDetectionDataHolder:
        """get an instance from a dictionary"""

        chart_options = []

        for option in d["data"]["chartOptions"]:
            chart_options.append(ChartOption.from_dict(option))

        controller_mappings = d["data"]["meta"]["controllerMappings"]

        return cls(project_id=d["project_id"], device_id=d["id"], collection_id=d["collection_id"],
                   heart_beat=controller_mappings["heartbeat"], ready=controller_mappings["mpcReady"],
                   error=controller_mappings["errorWarning"], name=d["name"], created_at=d["created_at"],
                   favorite=d["favorite"], error_rule=d["data"]["meta"]["errorRule"],
                   warning_rule=d["data"]["meta"]["warningRule"], site_id=d["data"]["meta"]["site_id"],
                   username=d["data"]["meta"]["username"], password=d["data"]["meta"]["password"],
                   anomaly_score=controller_mappings["anomalyScore"], chart_options=chart_options,
                   start=controller_mappings["startDate"], end=controller_mappings["endDate"],
                   width=d["data"]["selectedWidth"], threshold=d["data"]["threshold"])

    def to_dict(self) -> dict[str, ...]:
        """convert the current instance to a dictionary"""

        chart_options = [v.to_dict() for v in self.chart_options]
        d = {"collection_id": self.collection_id,
             "project_id": self.project_id,
             "created_at": self.created_at,
             "name": self.name,
             "id": self.device_id,
             "favorite": self.favorite,
             "data": {
                 "type": self.type_name,
                 "chartOptions": chart_options,
                 "selectedWidth": self.width,
                 "threshold": self.threshold,
                 "meta":
                     {
                         "controllerMappings": {
                             "anomalyScore": self.anomaly_score,
                             "heartbeat": self.heart_beat,
                             "mpcReady": self.ready,
                             "errorWarning": self.error,
                             "siteID": self.site_id
                         },
                         "errorRule": self.error_rule,
                         "warningRule": self.warning_rule,
                     },
             }}
        d["data"]["meta"]["controllerMappings"]["startDate"] = self.start
        d["data"]["meta"]["controllerMappings"]["endDate"] = self.end

        return d

    def get_data(self, start: int, end: int, add_minute_of_day: bool=True, **kwargs) -> pd.DataFrame:
        """get data for the model"""

        df = pd.DataFrame()
        for v in self.variables:
            data = fetch_data_from_http(v, self.project_id, start, end, "1m") # TODO: second layer hardcoded 
            df = append_data_to_dataframe_http(df, data, v)
        df = df.set_index("ts")
        if add_minute_of_day:
            df[["min_sin","min_cos"]] = [self.encode_minute_of_day(x) for x in (df.index.hour*60 + df.index.minute)]
        return df
    
    def encode_minute_of_day(self, minute):
        angle = minute * (2*math.pi / (24*60))
        
        return (0.5*(math.sin(angle)+1), (0.5*(math.cos(angle)+1)))
