from __future__ import annotations

from ai.data_holder.stream_anomaly_detection_data_holder import StreamAnomalyDetectionDataHolder
from ai.interface.model_holder import ModelHolder
from ai.model.stream_anomaly_detection_model import StreamAnomalyDetectionModel
from ai.status.stream_anomaly_detection_status import StreamAnomalyDetectionStatus
from ai.utils.stream_history_anomaly_detection_utils import anomaly_score


class StreamAnomalyDetectionModelHolder(ModelHolder):
    _dh: StreamAnomalyDetectionDataHolder
    _model: StreamAnomalyDetectionModel
    _status: StreamAnomalyDetectionStatus

    def __init__(self, dh: StreamAnomalyDetectionDataHolder,
                 model: StreamAnomalyDetectionModel, status: StreamAnomalyDetectionStatus) -> None:
        """creates a stream anomaly detection model holder instance"""

        super().__init__(dh, model, status)

    def get_dh(self) -> StreamAnomalyDetectionDataHolder:
        """return the attribute"""

        return self._dh

    def get_model(self) -> StreamAnomalyDetectionModel:
        """return the attribute"""

        return self._model

    def get_status(self) -> StreamAnomalyDetectionStatus:
        """return the attribute"""

        return self._status

    def get_anomaly_score(self, x: float) -> float:
        """compute the anomaly score for a single point"""

        return anomaly_score(self._model.forest, x)

    def set_anomaly_score(self, score: float) -> None:
        """set the anomaly score in the status"""

        self._status.anomaly_score = score

    def insert_point(self, x: float) -> None:
        """insert a point into the underlying model"""

        self._model.insert_point(x)

    # noinspection PyMethodOverriding
    @staticmethod
    def load_model_holder_from_s3(
            model_id: str, model_load: bool = True, status_load: bool = True) -> StreamAnomalyDetectionModelHolder:
        """load specific model holder from S3"""

        model_holder = ModelHolder.load_model_holder_from_s3(model_id, StreamAnomalyDetectionModelHolder, model_load,
                                                             status_load)
        if isinstance(model_holder, StreamAnomalyDetectionModelHolder):
            return model_holder
        else:
            raise ValueError()
