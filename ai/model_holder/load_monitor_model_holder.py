from __future__ import annotations

from ai.data_holder.load_monitor_data_holder import LoadMonitorDataHolder
from ai.interface.model_holder import ModelHolder
from ai.model.load_monitor_model import LoadMonitorModel
from ai.status.load_monitor_status import LoadMonitorStatus
from ai.utils.model_utils import update_request

class LoadMonitorModelHolder(ModelHolder):
    _dh: LoadMonitorDataHolder
    _model: LoadMonitorModel
    _status: LoadMonitorStatus

    def __init__(self, dh: LoadMonitorDataHolder,
                 model: LoadMonitorModel, status: LoadMonitorStatus) -> None:
        """creates a history anomaly detection model holder instance"""

        super().__init__(dh, model, status)

    def get_dh(self) -> LoadMonitorDataHolder:
        """return the attribute"""

        return self._dh

    def get_model(self) -> LoadMonitorModel:
        """return the attribute"""

        return self._model

    def get_status(self) -> LoadMonitorStatus:
        """return the attribute"""

        return self._status

    def get_window_size(self) -> int:
        """ return size of model window in minutes"""

        return self._model.window_size

    def update_load(self, load: float) -> None:
        """update the load value in the status"""

        self._status.load = load


    # noinspection PyMethodOverriding
    @staticmethod
    def load_model_holder_from_s3(
            model_id: str, model_load: bool = True, status_load: bool = True) -> LoadMonitorModelHolder:
        """load specific model holder from S3"""

        model_holder = ModelHolder.load_model_holder_from_s3(model_id, LoadMonitorModelHolder, model_load,
                                                             status_load)
        if isinstance(model_holder, LoadMonitorModelHolder):
            return model_holder
        else:
            raise ValueError()
        
    def change_settings(self, settings: dict) -> None:
        """change model settings"""

        if settings.get("bakingWindowDuration") is not None:
            self._dh.baking_window_duration = settings.get("bakingWindowDuration")
            
        update_request(self._dh)
        
    def get_baking_window_duration(self) -> int:
        """returns minutes of the baking window duration"""
        
        return self._dh.baking_window_duration