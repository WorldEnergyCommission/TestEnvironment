from __future__ import annotations

import datetime

import numpy as np

from ai.data_holder.ems_data_holder import EmsDataHolder
from ai.interface.model_holder import ModelHolder
from ai.model.ems_model import EmsModel
from ai.status.ems_status import EmsStatus
from ai.utils.ems_component_utils import HeatingPumpComponent, BatteryComponent, GridComponent
from ai.utils.ems_function_utils import assign_soc_or_tpow
from ai.utils.model_utils import update_request


class EmsModelHolder(ModelHolder):
    _dh: EmsDataHolder
    _model: EmsModel
    _status: EmsStatus

    def __init__(self, dh: EmsDataHolder,
                 model: EmsModel, status: EmsStatus) -> None:
        """creates an ems model holder instance"""

        super().__init__(dh, model, status)

    def get_dh(self) -> EmsDataHolder:
        """return the attribute"""

        return self._dh

    def get_model(self) -> EmsModel:
        """return the attribute"""

        return self._model

    def get_status(self) -> EmsStatus:
        """return the attribute"""

        return self._status

    def assign_prediction(self, names: list[str], powers: list[str], prediction: list[np.array],
                          include_last: bool = False) -> None:
        """assign predicted power and energy to the state"""

        i = 0
        for name, p in zip(names, powers):
            if p == "":
                t = np.linspace(0, 10 * np.pi, 96)
                self._status.predicted_power[name] = 50 * np.sin(t)
                self._status.predicted_energy[name] = np.cumsum(50 * np.sin(t))
                continue
            if include_last:
                self._status.predicted_power[name] = prediction[i]
            else:
                self._status.predicted_power[name] = prediction[i][:-1]
            self._status.predicted_energy[name] = np.cumsum(
                prediction[i] * 0.25)
            self._status.predicted_power_history[name] = prediction[i][0]
            i += 1

    def assign_soc(self, names: list[str], soc: list[str], prediction: list[np.array],
                   include_last: bool = False) -> None:
        """assign predicted soc to the state"""

        assign_soc_or_tpow(names, soc, prediction,
                           self._status.predicted_soc, include_last)

    def assign_tpow(self, names: list[str], tpow: list[str], prediction: list[np.array],
                    include_last: bool = False) -> None:
        """assign predicted target power to the state"""

        assign_soc_or_tpow(names, tpow, prediction,
                           self._status.predicted_target_power, include_last)

    def assign_results(self, y_pv: list[np.array], y_generator: list[np.array], y_grid: list[np.array],
                       y_battery: list[np.array], y_charge: list[np.array], y_house: list[np.array],
                       y_electric: list[np.array], y_pump: list[np.array], y_consumer: list[np.array],
                       y_soc: list[np.array], y_tpow_battery: list[np.array], y_tpow_charge: list[np.array],
                       y_tpow_electric: list[np.array], y_tpow_pump: list[np.array], y_tpow_consumer: list[np.array],
                       include_last: bool) -> None:
        """assign the predicted results to the object"""

        self.assign_prediction(
            self._dh.pv.name, self._dh.pv.power, y_pv)
        self.assign_prediction(
            self._dh.generator.name, self._dh.generator.power, y_generator)
        self.assign_prediction(
            self._dh.grid.name, self._dh.grid.power, y_grid, include_last)
        self.assign_prediction(
            self._dh.battery.name, self._dh.battery.power, y_battery, include_last)
        self.assign_prediction(
            self._dh.charge_station.name, self._dh.charge_station.power, y_charge)
        self.assign_prediction(
            self._dh.house.name, self._dh.house.power, y_house)
        self.assign_prediction(
            self._dh.electric_heating.name, self._dh.electric_heating.power, y_electric)
        self.assign_prediction(
            self._dh.heating_pump.name, self._dh.heating_pump.power, y_pump)
        self.assign_prediction(
            self._dh.big_consumer.name, self._dh.big_consumer.power, y_consumer)
        self.assign_soc(
            self._dh.battery.name, self._dh.battery.soc, y_soc, include_last)
        self.assign_tpow(
            self._dh.battery.name, self._dh.battery.target_power, y_tpow_battery)
        self.assign_tpow(
            self._dh.charge_station.name, self._dh.charge_station.target_power, y_tpow_charge)
        self.assign_tpow(
            self._dh.electric_heating.name, self._dh.electric_heating.target_power, y_tpow_electric)
        self.assign_tpow(
            self._dh.heating_pump.name, self._dh.heating_pump.target_power, y_tpow_pump)
        self.assign_tpow(
            self._dh.big_consumer.name, self._dh.big_consumer.target_power, y_tpow_consumer)

    def change_settings(self, settings: dict) -> None:
        """change model settings"""

        if settings.get("energyPrice") is not None:
            self._dh.energy_price = settings["energyPrice"]
        if settings.get("mode") is not None:
            self._dh.mode = settings["mode"]
        if settings.get("algorithmModelEms") is not None:
            self._dh.algorithm_model_ems = settings["algorithmModelEms"]

        update_request(self._dh)

    def get_model_error(self) -> float:
        """get the model error"""

        return self._model.error

    def set_model_error(self, error: float) -> None:
        """set the model error"""

        self._model.error = error

    def get_energy_price(self) -> dict[str, float | str]:
        """return the energy price"""

        return self._dh.energy_price

    def get_next_optimization_day(self) -> datetime.datetime | None:
        """return the next optimization day"""

        return self._status.next_optimization_day

    def set_next_optimization_day(self, next_optimization_day: datetime.datetime) -> None:
        """set the next optimization day"""

        self._status.next_optimization_day = next_optimization_day

    def get_heating_pump_component(self) -> HeatingPumpComponent:
        """get the heating pump component"""

        return self._dh.heating_pump

    def get_battery_component(self) -> BatteryComponent:
        """get the battery component"""

        return self._dh.battery

    def get_grid_component(self) -> GridComponent:
        """get the grid component"""

        return self._dh.grid

    def get_activate_heating_pump_variable(self) -> str:
        """return the variable used to activate the heating pump"""

        return self._dh.activate_heating_pump

    def get_predicted_power(self) -> dict[str, np.array]:
        """return the predicted powers"""

        return self._status.predicted_power

    def get_winter_mode(self) -> int:
        """return the winter mode"""

        return self._status.winter_mode

    def set_winter_mode(self, winter_mode: int) -> None:
        """set the winter mode"""

        self._status.winter_mode = winter_mode

    def set_enable_controlling(self, enable_controlling: int) -> None:
        """set enable controlling in the status"""

        self._status.enable_controlling = enable_controlling

    def set_predictions_in_status(self, bat_power: np.array, y_consumption: np.array) -> None:
        """set the prediction results in the status"""

        self._status.predicted_power["bat_power"] = bat_power
        self._status.predicted_power["consumption"] = y_consumption[:-1]
        self._status.predicted_energy["consumption"] = np.cumsum(
            y_consumption * 0.25)
        self._status.predicted_power_history["consumption"] = y_consumption[0]

    def has_battery(self) -> bool:
        """returns if the ems has a battery"""

        return self._model.has_battery

    def get_max_charge(self) -> float:
        """return the max charge"""

        return self._model.max_charge

    def get_operation_mode(self):
        """return the variable name of the operation mode"""

        return self._dh.operation_mode

    def get_algorithm_model_ems(self) -> int:
        """return the variable name of the algorithm model ems"""

        return self._dh.algorithm_model_ems

    def get_mode(self) -> int:
        """return the ems mode"""

        return self._dh.mode

    def get_battery_min_reserve(self) -> float:
        """get the minimal reserve of the battery"""

        return self._dh.get_battery_min_reserve()

    def get_allow_charging_state_variable(self) -> str:
        """returns the variable that controls the charging state"""

        return self._dh.allow_charging_state

    # noinspection PyMethodOverriding
    @staticmethod
    def load_model_holder_from_s3(
            model_id: str, model_load: bool = True, status_load: bool = True) -> EmsModelHolder:
        """load specific model holder from S3"""

        model_holder = ModelHolder.load_model_holder_from_s3(
            model_id, EmsModelHolder, model_load, status_load)
        if isinstance(model_holder, EmsModelHolder):
            return model_holder
        else:
            raise ValueError()
