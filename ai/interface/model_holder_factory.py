from ai.data_holder.consumption_service_data_holder import ConsumptionServiceDataHolder
from ai.data_holder.ems_data_holder import EmsDataHolder
from ai.data_holder.history_anomaly_detection_data_holder import HistoryAnomalyDetectionDataHolder
from ai.data_holder.pv_monitoring_service_data_holder import PvMonitoringServiceDataHolder
from ai.data_holder.pv_production_service_data_holder import PvProductionServiceDataHolder
from ai.data_holder.setpoint_optimizer_data_holder import SetpointOptimizerDataHolder
from ai.data_holder.stream_anomaly_detection_data_holder import StreamAnomalyDetectionDataHolder
from ai.data_holder.load_monitor_data_holder import LoadMonitorDataHolder

from ai.interface.data_holder import DataHolder
from ai.interface.model_factory import get_model
from ai.interface.model_holder import ModelHolder
from ai.interface.status_factory import get_status
from ai.model.consumption_service_model import ConsumptionServiceModel
from ai.model.ems_model import EmsModel
from ai.model.history_anomaly_detection_model import HistoryAnomalyDetectionModel
from ai.model.pv_monitoring_service_model import PvMonitoringServiceModel
from ai.model.pv_production_service_model import PvProductionServiceModel
from ai.model.setpoint_optimizer_model import SetpointOptimizerModel
from ai.model.load_monitor_model import LoadMonitorModel

from ai.model.stream_anomaly_detection_model import StreamAnomalyDetectionModel
from ai.model_holder.consumption_service_model_holder import ConsumptionServiceModelHolder
from ai.model_holder.ems_model_holder import EmsModelHolder
from ai.model_holder.history_anomaly_detection_model_holder import HistoryAnomalyDetectionModelHolder
from ai.model_holder.pv_monitoring_service_model_holder import PvMonitoringServiceModelHolder
from ai.model_holder.pv_production_service_model_holder import PvProductionServiceModelHolder
from ai.model_holder.setpoint_optimizer_model_holder import SetpointOptimizerModelHolder
from ai.model_holder.stream_anomaly_detection_model_holder import StreamAnomalyDetectionModelHolder
from ai.model_holder.load_monitor_model_holder import LoadMonitorModelHolder

from ai.status.consumption_service_status import ConsumptionServiceStatus
from ai.status.ems_status import EmsStatus
from ai.status.history_anomaly_detection_status import HistoryAnomalyDetectionStatus
from ai.status.pv_monitoring_service_status import PvMonitoringServiceStatus
from ai.status.pv_production_service_status import PvProductionServiceStatus
from ai.status.setpoint_optimizer_status import SetpointOptimizerStatus
from ai.status.stream_anomaly_detection_status import StreamAnomalyDetectionStatus
from ai.status.load_monitor_status import LoadMonitorStatus



def get_model_holder(dh: DataHolder) -> ModelHolder:
    """creates a model holder instance for the passed data holder instance"""

    # get an appropriate model for the data holder
    model = get_model(dh)

    # get an appropriate status for the data holder
    status = get_status(dh)

    if isinstance(dh, PvProductionServiceDataHolder) and \
            isinstance(model, PvProductionServiceModel) and isinstance(status, PvProductionServiceStatus):
        holder = PvProductionServiceModelHolder(dh, model, status)
    elif isinstance(dh, ConsumptionServiceDataHolder) and \
            isinstance(model, ConsumptionServiceModel) and isinstance(status, ConsumptionServiceStatus):
        holder = ConsumptionServiceModelHolder(dh, model, status)
    elif isinstance(dh, EmsDataHolder) and \
            isinstance(model, EmsModel) and isinstance(status, EmsStatus):
        holder = EmsModelHolder(dh, model, status)
    elif isinstance(dh, PvMonitoringServiceDataHolder) and \
            isinstance(model, PvMonitoringServiceModel) and isinstance(status, PvMonitoringServiceStatus):
        holder = PvMonitoringServiceModelHolder(dh, model, status)
    elif isinstance(dh, StreamAnomalyDetectionDataHolder) and \
            isinstance(model, StreamAnomalyDetectionModel) and isinstance(status, StreamAnomalyDetectionStatus):
        holder = StreamAnomalyDetectionModelHolder(dh, model, status)
    elif isinstance(dh, HistoryAnomalyDetectionDataHolder) and \
            isinstance(model, HistoryAnomalyDetectionModel) and isinstance(status, HistoryAnomalyDetectionStatus):
        holder = HistoryAnomalyDetectionModelHolder(dh, model, status)
    elif isinstance(dh, SetpointOptimizerDataHolder) and \
            isinstance(model, SetpointOptimizerModel) and isinstance(status, SetpointOptimizerStatus):
        holder = SetpointOptimizerModelHolder(dh, model, status)
    elif isinstance(dh, LoadMonitorDataHolder) and \
            isinstance(model, LoadMonitorModel) and isinstance(status, LoadMonitorStatus):
        holder = LoadMonitorModelHolder(dh, model, status)
    else:
        raise ValueError('unsupported data holder type')
    return holder
