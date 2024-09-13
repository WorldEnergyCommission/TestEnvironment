from __future__ import annotations

import logging

import numpy as np

from ai.data_holder.setpoint_optimizer_data_holder import SetpointOptimizerDataHolder
from ai.interface.model_holder import ModelHolder
from ai.model.setpoint_optimizer_model import SetpointOptimizerModel
from ai.status.setpoint_optimizer_status import SetpointOptimizerStatus
from ai.utils.model_utils import update_request


class SetpointOptimizerModelHolder(ModelHolder):
    _dh: SetpointOptimizerDataHolder
    _model: SetpointOptimizerModel
    _status: SetpointOptimizerStatus

    def __init__(self, dh: SetpointOptimizerDataHolder,
                 model: SetpointOptimizerModel, status: SetpointOptimizerStatus) -> None:
        """creates a setpoint optimizer model holder instance"""

        super().__init__(dh, model, status)

    def get_dh(self) -> SetpointOptimizerDataHolder:
        """return the attribute"""

        return self._dh

    def get_model(self) -> SetpointOptimizerModel:
        """return the attribute"""

        return self._model

    def get_status(self) -> SetpointOptimizerStatus:
        """return the attribute"""

        return self._status

    def change_parameters(self, parameters: dict) -> None:
        """change setpoint optimizer parameters"""

        for key, systems in self._model.__dict__.items():
            if "_curves" not in key:
                continue
            if key not in parameters.keys():
                continue
            for k, sys in systems.items():
                trial_params = {
                    "c1": parameters[key]["c1"], "c2": parameters[key]["c2"], "c3": parameters[key]["c3"]}
                self._model.__dict__[key][k].c1 = parameters[key]["c1"]
                self._model.__dict__[key][k].c2 = parameters[key]["c2"]
                self._model.__dict__[key][k].c3 = parameters[key]["c3"]
                if "hybrid" in key:
                    trial_params["hybrid_c1"] = parameters[key]["hybrid_c1"]
                    trial_params["hybrid_c2"] = parameters[key]["hybrid_c2"]
                    trial_params["hybrid_c3"] = parameters[key]["hybrid_c3"]
                    self._model.__dict__[
                        key][k].hybrid_c1 = parameters[key]["hybrid_c1"]
                    self._model.__dict__[
                        key][k].hybrid_c2 = parameters[key]["hybrid_c2"]
                    self._model.__dict__[
                        key][k].hybrid_c3 = parameters[key]["hybrid_c3"]
                self._model.__dict__[
                    key][k].constrains = parameters[key]["constrains"]

                if not self._model.__dict__[key][k].study_finished:
                    self._model.__dict__[
                        key][k].study.enqueue_trial(trial_params)
                    try:
                        self._model.__dict__[key][k].study.tell(
                            self._model.__dict__[key][k].trial, 1000)
                        self._model.__dict__[key][k].trial = \
                            self._model.__dict__[key][k].study.ask()
                    except Exception as e:
                        logging.error(f'error during setpoint optimizer parameter change with {(key, k)}: {repr(e)}\n'
                                      f'last trial was: {self._model.__dict__[key][k].trial}')

    def change_settings(self, settings: dict) -> None:
        """change model settings"""
        
        am = settings.get("algorithmModel")
        aap = settings.get("algorithmAdditionalProcessors")
        
        if am is not None and aap is not None:
            self._dh.algorithm_model = am
            self._dh.algorithm_additional_processors = aap
            update_request(self._dh)
            return
        
        for sys in [self._dh.heating_water_systems, self._dh.heating_air_systems,
                    self._dh.cooling_water_systems, self._dh.cooling_air_systems,
                    self._dh.hybrid_water_systems, self._dh.hybrid_air_systems]:
            for c in sys:
                logging.debug(c.identifier)
                system_identifier = settings.get("identifier")
                if c.identifier == system_identifier:
                    if "hybrid" in c.identifier:
                        settings["max_flow_temperature"]["heating"] = float(
                            settings["max_flow_temperature"]["heating"])
                        settings["min_flow_temperature"]["heating"] = float(
                            settings["min_flow_temperature"]["heating"])
                        settings["set_point_temperature"]["heating"] = float(
                            settings["set_point_temperature"]["heating"])
                        settings["advanced_curve_settings"]["heating"] = bool(
                            settings["advanced_curve_settings"]["heating"])

                        settings["max_flow_temperature"]["cooling"] = float(
                            settings["max_flow_temperature"]["cooling"])
                        settings["min_flow_temperature"]["cooling"] = float(
                            settings["min_flow_temperature"]["cooling"])
                        settings["set_point_temperature"]["cooling"] = float(
                            settings["set_point_temperature"]["cooling"])
                        settings["advanced_curve_settings"]["cooling"] = float(
                            settings["advanced_curve_settings"]["cooling"])
                        
                        c.max_flow_temperature = settings["max_flow_temperature"]
                        c.min_flow_temperature = settings["min_flow_temperature"]
                        c.set_point_temperature = settings["set_point_temperature"]
                        c.advanced_curve_settings = settings["advanced_curve_settings"]
                    else:
                        c.max_flow_temperature = float(
                            settings["max_flow_temperature"])
                        c.min_flow_temperature = float(
                            settings["min_flow_temperature"])
                        c.set_point_temperature = float(
                            settings["set_point_temperature"])
                        c.advanced_curve_settings = bool(
                            settings["advanced_curve_settings"])

                    y1_y_range = settings.get("y1_y_range", {})
                    c.y1_y_range = {"upper": int(y1_y_range.get(
                        "upper", 60)), "lower": int(y1_y_range.get("lower", 25))}

                    y2_y_range = settings.get("y2_y_range", {})
                    c.y2_y_range = {"upper": int(y2_y_range.get(
                        "upper", 60)), "lower": int(y2_y_range.get("lower", 25))}

                    x_range = settings.get("x_range", {})
                    c.x_range = {"left": int(x_range.get(
                        "left", -15)), "right": int(x_range.get("right", 15))}

                    c.y1_y2_diff = int(settings.get("y1_y2_diff", -5))

                    update_request(self._dh)
                    return
        raise KeyError("identifier not present in setpoint optimizer")

    def get_next_update_date(self) -> int | None:
        """return the next update date"""

        return self._status.next_update_date

    def set_next_update_date(self, next_update_date: int) -> None:
        """set the next update date"""

        self._status.next_update_date = next_update_date

    def set_start_and_end_timestamp(self, start: int, end: int) -> None:
        """set start and end timestamp"""

        self._status.ts_start = start
        self._status.ts_end = end

    def set_curve_params(
            self, params: dict[str, dict[str, dict[str, float | bool | None]]] | dict[
                str, dict[str, float | bool | None]]) -> None:
        """set the curve parameters in the status"""

        self._status.curve_params = params

    def get_curve_params(self, state: bool) -> dict[str, dict[str, float | bool | None]]:
        """read the curve parameters from the model"""

        return self._model.get_params(state)

    def is_setpoint_optimizer_next_generation(self) -> bool:
        """check if the setpoint optimizer is next generation"""

        return self._dh.is_setpoint_optimizer_next_generation()

    def update_setpoint_temperature(self, y: dict[str, np.array], index: int) -> None:
        """update the setpoint temperature in the status"""

        for k, result in y.items():
            self._status.predicted_setpoint_temperature[k] = list(
                result[index:])
            self._status.write_to_mqtt[k] = result[index]

    # noinspection PyMethodOverriding
    @staticmethod
    def load_model_holder_from_s3(
            model_id: str, model_load: bool = True, status_load: bool = True) -> SetpointOptimizerModelHolder:
        """load specific model holder from S3"""

        model_holder = ModelHolder.load_model_holder_from_s3(model_id, SetpointOptimizerModelHolder, model_load,
                                                             status_load)
        if isinstance(model_holder, SetpointOptimizerModelHolder):
            return model_holder
        else:
            raise ValueError()
