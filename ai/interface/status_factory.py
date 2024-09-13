from ai.data_holder.consumption_service_data_holder import ConsumptionServiceDataHolder
from ai.data_holder.ems_data_holder import EmsDataHolder
from ai.data_holder.history_anomaly_detection_data_holder import HistoryAnomalyDetectionDataHolder
from ai.data_holder.pv_monitoring_service_data_holder import PvMonitoringServiceDataHolder
from ai.data_holder.pv_production_service_data_holder import PvProductionServiceDataHolder
from ai.data_holder.setpoint_optimizer_data_holder import SetpointOptimizerDataHolder
from ai.data_holder.stream_anomaly_detection_data_holder import StreamAnomalyDetectionDataHolder
from ai.data_holder.load_monitor_data_holder import LoadMonitorDataHolder

from ai.interface.data_holder import DataHolder
from ai.interface.status import Status
from ai.status.consumption_service_status import ConsumptionServiceStatus
from ai.status.ems_status import EmsStatus
from ai.status.history_anomaly_detection_status import HistoryAnomalyDetectionStatus
from ai.status.pv_monitoring_service_status import PvMonitoringServiceStatus
from ai.status.pv_production_service_status import PvProductionServiceStatus
from ai.status.setpoint_optimizer_status import SetpointOptimizerStatus
from ai.status.stream_anomaly_detection_status import StreamAnomalyDetectionStatus
from ai.status.load_monitor_status import LoadMonitorStatus



def get_status(dh: DataHolder) -> Status:
    """creates a status instance for the passed data holder instance"""

    if isinstance(dh, PvProductionServiceDataHolder):
        status = PvProductionServiceStatus()
    elif isinstance(dh, ConsumptionServiceDataHolder):
        status = ConsumptionServiceStatus()
    elif isinstance(dh, EmsDataHolder):
        status = EmsStatus()
        status.fill_initial_values(dh)
    elif isinstance(dh, PvMonitoringServiceDataHolder):
        status = PvMonitoringServiceStatus()
    elif isinstance(dh, StreamAnomalyDetectionDataHolder):
        status = StreamAnomalyDetectionStatus()
    elif isinstance(dh, HistoryAnomalyDetectionDataHolder):
        status = HistoryAnomalyDetectionStatus()
    elif isinstance(dh, SetpointOptimizerDataHolder):
        status = SetpointOptimizerStatus()
        status.fill_initial_values(dh)
    elif isinstance(dh, LoadMonitorDataHolder):
        status = LoadMonitorStatus()
    else:
        raise ValueError('unsupported data holder type')

    status.status = "training"
    status.training = True

    return status
