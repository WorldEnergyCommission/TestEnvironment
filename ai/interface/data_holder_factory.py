import datetime
import uuid

from ai.data_holder.consumption_service_data_holder import ConsumptionServiceDataHolder
from ai.data_holder.ems_data_holder import EmsDataHolder
from ai.data_holder.history_anomaly_detection_data_holder import HistoryAnomalyDetectionDataHolder
from ai.data_holder.pv_monitoring_service_data_holder import PvMonitoringServiceDataHolder
from ai.data_holder.pv_production_service_data_holder import PvProductionServiceDataHolder
from ai.data_holder.setpoint_optimizer_data_holder import SetpointOptimizerDataHolder
from ai.data_holder.stream_anomaly_detection_data_holder import StreamAnomalyDetectionDataHolder
from ai.data_holder.load_monitor_data_holder import LoadMonitorDataHolder

from ai.interface.data_holder import DataHolder
from ai.weather.weather_holder import WeatherHolder


def get_data_holder(r: dict, changed: bool = False) -> DataHolder:
    """get a dataholder for the passed dictionary"""

    if not changed:
        r["id"] = str(uuid.uuid4())

    if "debug_id" in r.keys():
        r["id"] = r["debug_id"]

    if not changed:
        r["favorite"] = False
        r["created_at"] = datetime.datetime.utcnow().isoformat()

    if ("AnomalyDetection" not in r["data"]["type"]) and ("LoadMonitor" not in r["data"]["type"]):
        weather_holder = WeatherHolder.load_weather_holder_from_s3(r["project_id"])
        r["data"]["meta"]["site_id"] = weather_holder.get_site_id()
        r["data"]["meta"]["username"] = weather_holder.get_username()
        r["data"]["meta"]["password"] = weather_holder.get_password()
    else:
        r["data"]["meta"]["site_id"] = ""
        r["data"]["meta"]["username"] = ""
        r["data"]["meta"]["password"] = ""

    if r["data"]["type"] == "PVProductionService":
        dh = PvProductionServiceDataHolder.from_dict(r)
    elif r["data"]["type"] == "ConsumptionService":
        dh = ConsumptionServiceDataHolder.from_dict(r)
    elif r["data"]["type"] == "EMS":
        dh = EmsDataHolder.from_dict(r)
    elif r["data"]["type"] == "PVMonitoringService":
        dh = PvMonitoringServiceDataHolder.from_dict(r)
    elif r["data"]["type"] == "StreamAnomalyDetection":
        dh = StreamAnomalyDetectionDataHolder.from_dict(r)
    elif r["data"]["type"] == "HistoryAnomalyDetection":
        dh = HistoryAnomalyDetectionDataHolder.from_dict(r)
    elif r["data"]["type"] == "SetpointOptimizer":
        dh = SetpointOptimizerDataHolder.from_dict(r)
    elif r["data"]["type"] == "LoadMonitor":
        dh = LoadMonitorDataHolder.from_dict(r)
    else:
        raise ValueError("(data holder) unknown device type")

    return dh
