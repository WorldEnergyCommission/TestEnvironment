from __future__ import annotations

from ai.data_holder.pv_production_service_data_holder import PvProductionServiceDataHolder
from ai.interface.model_holder import ModelHolder
from ai.model.pv_production_service_model import PvProductionServiceModel
from ai.status.pv_production_service_status import PvProductionServiceStatus


class PvProductionServiceModelHolder(ModelHolder):
    _dh: PvProductionServiceDataHolder
    _model: PvProductionServiceModel
    _status: PvProductionServiceStatus

    def __init__(self, dh: PvProductionServiceDataHolder,
                 model: PvProductionServiceModel, status: PvProductionServiceStatus) -> None:
        """creates a pv production service model holder instance"""

        super().__init__(dh, model, status)

    def get_dh(self) -> PvProductionServiceDataHolder:
        """return the attribute"""

        return self._dh

    def get_model(self) -> PvProductionServiceModel:
        """return the attribute"""

        return self._model

    def get_status(self) -> PvProductionServiceStatus:
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
            model_id: str, model_load: bool = True, status_load: bool = True) -> PvProductionServiceModelHolder:
        """load specific model holder from S3"""

        model_holder = ModelHolder.load_model_holder_from_s3(model_id, PvProductionServiceModelHolder, model_load,
                                                             status_load)
        if isinstance(model_holder, PvProductionServiceModelHolder):
            return model_holder
        else:
            raise ValueError()
