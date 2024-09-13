from __future__ import annotations

from ai.data_holder.history_anomaly_detection_data_holder import HistoryAnomalyDetectionDataHolder
from ai.interface.model_holder import ModelHolder
from ai.model.history_anomaly_detection_model import HistoryAnomalyDetectionModel
from ai.status.history_anomaly_detection_status import HistoryAnomalyDetectionStatus
from ai.utils.stream_history_anomaly_detection_utils import anomaly_score


class HistoryAnomalyDetectionModelHolder(ModelHolder):
    _dh: HistoryAnomalyDetectionDataHolder
    _model: HistoryAnomalyDetectionModel
    _status: HistoryAnomalyDetectionStatus

    def __init__(self, dh: HistoryAnomalyDetectionDataHolder,
                 model: HistoryAnomalyDetectionModel, status: HistoryAnomalyDetectionStatus) -> None:
        """creates a history anomaly detection model holder instance"""

        super().__init__(dh, model, status)

    def get_dh(self) -> HistoryAnomalyDetectionDataHolder:
        """return the attribute"""

        return self._dh

    def get_model(self) -> HistoryAnomalyDetectionModel:
        """return the attribute"""

        return self._model

    def get_status(self) -> HistoryAnomalyDetectionStatus:
        """return the attribute"""

        return self._status

    def get_end(self) -> int:
        """get the end timestamp of the model"""

        return self._dh.end

    def get_anomaly_score(self, x: float) -> float:
        """compute the anomaly score for a single point"""

        return anomaly_score(self._model.forest, x)

    def set_anomaly_score(self, score: float) -> None:
        """set the anomaly score in the status"""

        self._status.anomaly_score = score

    # noinspection PyMethodOverriding
    @staticmethod
    def load_model_holder_from_s3(
            model_id: str, model_load: bool = True, status_load: bool = True) -> HistoryAnomalyDetectionModelHolder:
        """load specific model holder from S3"""

        model_holder = ModelHolder.load_model_holder_from_s3(model_id, HistoryAnomalyDetectionModelHolder, model_load,
                                                             status_load)
        if isinstance(model_holder, HistoryAnomalyDetectionModelHolder):
            return model_holder
        else:
            raise ValueError()
