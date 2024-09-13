from __future__ import annotations

from ai.data_holder.pv_monitoring_service_data_holder import PvMonitoringServiceDataHolder
from ai.interface.model_holder import ModelHolder
from ai.model.pv_monitoring_service_model import PvMonitoringServiceModel
from ai.status.pv_monitoring_service_status import PvMonitoringServiceStatus


class PvMonitoringServiceModelHolder(ModelHolder):
    _dh: PvMonitoringServiceDataHolder
    _model: PvMonitoringServiceModel
    _status: PvMonitoringServiceStatus

    def __init__(self, dh: PvMonitoringServiceDataHolder,
                 model: PvMonitoringServiceModel, status: PvMonitoringServiceStatus) -> None:
        """creates a pv monitoring service model holder instance"""

        super().__init__(dh, model, status)

    def get_dh(self) -> PvMonitoringServiceDataHolder:
        """return the attribute"""

        return self._dh

    def get_model(self) -> PvMonitoringServiceModel:
        """return the attribute"""

        return self._model

    def get_status(self) -> PvMonitoringServiceStatus:
        """return the attribute"""

        return self._status

    def get_end(self) -> int:
        """get the end timestamp of the model"""

        return self._dh.end

    def get_decay(self) -> str:
        """get the decay variable"""

        return self._dh.decay

    def update_efficiency(self, efficiency: float, current_day: int) -> None:
        """update the efficiency in the status"""

        if current_day != self._status.last_update_day:
            self._status.last_three_days.append(efficiency)
            self._status.last_three_days.pop(0)
            self._status.last_update_day = current_day
        max_efficiency = max(self._status.last_three_days)
        self._status.efficiency = max_efficiency

    # noinspection PyMethodOverriding
    @staticmethod
    def load_model_holder_from_s3(
            model_id: str, model_load: bool = True, status_load: bool = True) -> PvMonitoringServiceModelHolder:
        """load specific model holder from S3"""

        model_holder = ModelHolder.load_model_holder_from_s3(model_id, PvMonitoringServiceModelHolder, model_load,
                                                             status_load)
        if isinstance(model_holder, PvMonitoringServiceModelHolder):
            return model_holder
        else:
            raise ValueError()
