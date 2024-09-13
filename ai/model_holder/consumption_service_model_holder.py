from __future__ import annotations

from ai.data_holder.consumption_service_data_holder import ConsumptionServiceDataHolder
from ai.interface.model_holder import ModelHolder
from ai.model.consumption_service_model import ConsumptionServiceModel
from ai.status.consumption_service_status import ConsumptionServiceStatus


class ConsumptionServiceModelHolder(ModelHolder):
    _dh: ConsumptionServiceDataHolder
    _model: ConsumptionServiceModel
    _status: ConsumptionServiceStatus

    def __init__(self, dh: ConsumptionServiceDataHolder,
                 model: ConsumptionServiceModel, status: ConsumptionServiceStatus) -> None:
        """creates a consumption service model holder instance"""

        super().__init__(dh, model, status)

    def get_dh(self) -> ConsumptionServiceDataHolder:
        """return the attribute"""

        return self._dh

    def get_model(self) -> ConsumptionServiceModel:
        """return the attribute"""

        return self._model

    def get_status(self) -> ConsumptionServiceStatus:
        """return the attribute"""

        return self._status

    def get_data_type(self) -> int:
        """return the attribute"""

        return self._dh.data_type

    def get_power_variable(self) -> str:
        """return the power variable"""

        return self._dh.power

    def set_predictions(self, pv: list[float], en: list[float]) -> None:
        """assign the predictions"""

        self._status.predicted_power = pv[1:]
        self._status.predicted_energy = en[1:]
        self._status.predicted_power_history = pv[0]

    def set_daily_energy(self, daily_energy: float) -> None:
        """set the daily energy"""

        self._status.current_energy = daily_energy

    # noinspection PyMethodOverriding
    @staticmethod
    def load_model_holder_from_s3(
            model_id: str, model_load: bool = True, status_load: bool = True) -> ConsumptionServiceModelHolder:
        """load specific model holder from S3"""

        model_holder = ModelHolder.load_model_holder_from_s3(model_id, ConsumptionServiceModelHolder, model_load,
                                                             status_load)
        if isinstance(model_holder, ConsumptionServiceModelHolder):
            return model_holder
        else:
            raise ValueError()
