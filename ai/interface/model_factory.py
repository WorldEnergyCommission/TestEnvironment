from ai.data_holder.consumption_service_data_holder import ConsumptionServiceDataHolder
from ai.data_holder.ems_data_holder import EmsDataHolder
from ai.data_holder.history_anomaly_detection_data_holder import HistoryAnomalyDetectionDataHolder
from ai.data_holder.pv_monitoring_service_data_holder import PvMonitoringServiceDataHolder
from ai.data_holder.pv_production_service_data_holder import PvProductionServiceDataHolder
from ai.data_holder.setpoint_optimizer_data_holder import SetpointOptimizerDataHolder
from ai.data_holder.stream_anomaly_detection_data_holder import StreamAnomalyDetectionDataHolder
from ai.data_holder.load_monitor_data_holder import LoadMonitorDataHolder

from ai.interface.data_holder import DataHolder
from ai.interface.model import Model
from ai.model.consumption_service_model import ConsumptionServiceModel
from ai.model.ems_model import EmsModel
from ai.model.history_anomaly_detection_model import HistoryAnomalyDetectionModel
from ai.model.pv_monitoring_service_model import PvMonitoringServiceModel
from ai.model.pv_production_service_model import PvProductionServiceModel
from ai.model.setpoint_optimizer_model import SetpointOptimizerModel
from ai.model.stream_anomaly_detection_model import StreamAnomalyDetectionModel
from ai.model.load_monitor_model import LoadMonitorModel



def get_model(dh: DataHolder) -> Model:
    """creates a model instance for the passed data holder instance"""

    if isinstance(dh, PvProductionServiceDataHolder):
        model = PvProductionServiceModel()
    elif isinstance(dh, ConsumptionServiceDataHolder):
        model = ConsumptionServiceModel()
    elif isinstance(dh, EmsDataHolder):
        model = EmsModel()
    elif isinstance(dh, PvMonitoringServiceDataHolder):
        model = PvMonitoringServiceModel()
    elif isinstance(dh, StreamAnomalyDetectionDataHolder):
        model = StreamAnomalyDetectionModel()
    elif isinstance(dh, HistoryAnomalyDetectionDataHolder):
        model = HistoryAnomalyDetectionModel()
    elif isinstance(dh, SetpointOptimizerDataHolder):
        model = SetpointOptimizerModel(dh.device_id, dh.project_id)
    elif isinstance(dh, LoadMonitorDataHolder):
        model = LoadMonitorModel()
    else:
        raise ValueError('unsupported data holder type')
    return model
