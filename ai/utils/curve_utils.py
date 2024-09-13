import datetime
import logging
import os
from typing import Union

import numpy as np
import optuna
import pandas as pd
import pytz

from ai.utils.parameter_utils import SETPOINT_OPTIMIZER_CONSTRAINTS, SETPOINT_OPTIMIZER_INITIAL_PARAMETERS
from ai.utils.s3_utils import store_to_s3, get_ai_bucket_name, get_setpoint_optimizer_study_key, StoreMode, \
    get_setpoint_optimizer_best_params_key, does_key_exist, load_from_s3


def get_studies_folder_name() -> str:
    """get folder name for studies"""

    return 'Studies'


def get_studies_folder_path() -> str:
    """get folder path for studies"""

    return os.path.join(os.getcwd(), get_studies_folder_name())


def get_study_path(study_name: str) -> str:
    """get folder path for studies"""

    return os.path.join(get_studies_folder_path(), f'{study_name}.pickle')


def get_best_params_path(study_name: str) -> str:
    """get folder path for studies"""

    return os.path.join(get_studies_folder_path(), f'{study_name}_best_params.pickle')


class Curve:
    def __init__(
            self, name: str, model_id: str, system: str, type_name: str,
            alpha: float, project_id: str) -> None:
        """creates a curve instance"""

        self.model_id = model_id
        self.system = system
        self.study_name = self.get_study_name()
        self.study = self.load_or_create_new_study()
        self.best_trial = None
        self.study_finished = False
        self.high_enough = True
        self.type_name = type_name
        self.project_id = project_id
        self.state = 0
        self.name = name

        self.c1 = None
        self.c2 = None
        self.c3 = None

        self.hybrid_c1 = None
        self.hybrid_c2 = None
        self.hybrid_c3 = None

        self.constrains = SETPOINT_OPTIMIZER_CONSTRAINTS[self.type_name]
        if len(self.study.trials) == 0:
            self.study.enqueue_trial(
                SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name])

        self.alpha = alpha
        self.trial = None

        self.above_set_temperature = False
        self.hybrid_operation_mode = None
        self.setpoint_hit_score = None
        self.smoothness = 0
        self.since_off_state = 0

        self.update(19.5, [22], init=True)

    def get_study_name(self):
        """create the study name from model and system"""

        return f'{self.model_id}_{self.system}_study'

    def load_or_create_new_study(self) -> optuna.study.study.Study:
        """load or create a new study"""

        if Curve.does_study_exist_in_s3(self.model_id, self.system):
            study = Curve.load_study_from_s3(self.model_id, self.system)
        else:
            study = optuna.study.create_study(
                study_name=self.study_name
            )
        return study

    def save_study(self) -> None:
        """save the currently used study"""

        Curve.store_setpoint_optimizer_study_to_s3(
            self.study, self.model_id, self.system)

    def load_best_params_if_they_exist(self) -> dict | None:
        """load best parameters if they exist"""

        logging.debug("loading best params if they exist")
        if Curve.do_best_params_exist_in_s3(self.model_id, self.system):
            return Curve.load_best_params_from_s3(self.model_id, self.system)
        else:
            return None

    def save_best_params(self) -> None:
        """save the best parameters"""
        logging.debug("saving the best parameters")
        Curve.store_setpoint_optimizer_best_params_to_s3(
            self.best_trial, self.model_id, self.system)

    def are_best_params_present(self) -> bool:
        """are best parameters present"""

        logging.debug("checking if best params are present")
        return self.load_best_params_if_they_exist() is not None

    def get_initial_parameters(self) -> tuple[float, float, float, float, float, float]:
        """read the initial parameters out of the constant and return them"""

        c1 = SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c1"]
        c2 = SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c2"]
        c3 = SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c3"]
        if 'hybrid' in self.type_name:
            hybrid_c1 = SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["hybrid_c1"]
            hybrid_c2 = SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["hybrid_c2"]
            hybrid_c3 = SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["hybrid_c3"]
        else:
            hybrid_c1 = None
            hybrid_c2 = None
            hybrid_c3 = None
        return c1, c2, c3, hybrid_c1, hybrid_c2, hybrid_c3

    def update(self, setpoint: float, max_temp: list[float],
               init: bool = False) -> dict[str, float | bool | None]:
        """return new setpoint optimizer parameters"""

        threshold = 0.9
        max_tries = 2500
        setpoint = float(setpoint)

        if init and self.best_trial is None:
            self.setpoint_hit_score = 0
            self.load_parameters(setpoint, max_temp)
        else:
            prev_score = self.evaluate_params([setpoint], max_temp[0], self.c1, self.c2, self.c3, self.hybrid_c1,
                                              self.hybrid_c2, self.hybrid_c3)
            if self.best_trial["parameters_score"] - 0.0001 <= prev_score < self.best_trial["parameters_score"] \
                    and not self.high_enough:
                self.study_finished = True

            if self.setpoint_hit_score > threshold and prev_score < self.best_trial["parameters_score"]:
                self.best_trial = {
                    "params": {
                        "c1": self.c1,
                        "c2": self.c2,
                        "c3": self.c3,
                        "hybrid_c1": self.hybrid_c1,
                        "hybrid_c2": self.hybrid_c2,
                        "hybrid_c3": self.hybrid_c3
                    },
                    "hit_setpoint_score": self.setpoint_hit_score,
                    "parameters_score": prev_score,
                    "best_parameters_found": self.study_finished
                }
        if self.study_finished:
            return {
                "c1": self.c1,
                "c2": self.c2,
                "c3": self.c3,
                "hybrid_c1": self.hybrid_c1,
                "hybrid_c2": self.hybrid_c2,
                "hybrid_c3": self.hybrid_c3,
                "study_finished": self.study_finished
            }

        # set default parameters to the initial parameters
        next_c1, next_c2, next_c3, next_c_c1, next_c_c2, next_c_c3 = self.get_initial_parameters()

        if init:
            next_c1, next_c2, next_c3, next_c_c1, next_c_c2, next_c_c3 = self.get_parameters()
        elif self.setpoint_hit_score > threshold:
            self.high_enough = True
            old_score = self.evaluate_params([setpoint], max_temp[0], self.c1, self.c2, self.c3, self.hybrid_c1,
                                             self.hybrid_c2,
                                             self.hybrid_c3)
            new_score = old_score + 0.0000001
            count = 0
            while old_score < new_score:
                break_loop, new_score = self.check_if_max_tries_reached_and_compute_new_score(
                    count, max_tries, setpoint, max_temp)
                if break_loop:
                    break
                if old_score < new_score:
                    self.study.tell(self.trial, 1000 * new_score)
                count += 1

        else:
            self.high_enough = False
            old_score = self.evaluate_params(
                [setpoint], max_temp[0], self.c1, self.c2, self.c3)
            new_score = old_score - 0.0000001

            if old_score != self.best_trial["parameters_score"]:
                count = 0
                while old_score > new_score or new_score > self.best_trial["parameters_score"]:
                    break_loop, new_score = self.check_if_max_tries_reached_and_compute_new_score(
                        count, max_tries, setpoint, max_temp)
                    if break_loop:
                        break
                    if old_score > new_score or new_score > self.best_trial["parameters_score"]:
                        self.study.tell(self.trial, 1000 * new_score)
                    count += 1
            else:
                count = 0
                while old_score > new_score or new_score > old_score + 0.001:
                    break_loop, new_score = self.check_if_max_tries_reached_and_compute_new_score(
                        count, max_tries, setpoint, max_temp)
                    if break_loop:
                        break
                    if old_score > new_score or new_score > old_score + 0.001:
                        self.study.tell(self.trial, 1000 * new_score)

                    count += 1

        if self.study_finished:
            return {
                "c1": self.c1,
                "c2": self.c2,
                "c3": self.c3,
                "hybrid_c1": self.hybrid_c1,
                "hybrid_c2": self.hybrid_c2,
                "hybrid_c3": self.hybrid_c3,
                "study_finished": self.study_finished
            }
        else:
            self.c1 = next_c1
            self.c2 = next_c2
            self.c3 = next_c3
            self.hybrid_c1 = next_c_c1
            self.hybrid_c2 = next_c_c2
            self.hybrid_c3 = next_c_c3

        return {
            "c1": self.c1,
            "c2": self.c2,
            "c3": self.c3,
            "hybrid_c1": self.hybrid_c1,
            "hybrid_c2": self.hybrid_c2,
            "hybrid_c3": self.hybrid_c3,
            "study_finished": self.study_finished
        }

    def check_if_max_tries_reached_and_compute_new_score(
            self, count: int, max_tries: int, setpoint: float, max_temp: list[float]) -> tuple[bool, float]:
        """check if optimization is done and return a score for new parameters if not"""

        if count > max_tries:
            if "hybrid" in self.type_name:
                self.load_parameters_from_best_trial()
                self.study_finished = True
                logging.info("Too many retries. Best parameters reached")
                return True, 0
            else:
                self.c1 = self.best_trial["params"]["c1"]
                self.c2 = self.best_trial["params"]["c2"]
                self.c3 = self.best_trial["params"]["c3"]
                self.study_finished = True
                logging.info("Too many retries. Best parameters reached")
                return True, 0

        next_c1, next_c2, next_c3, next_c_c1, next_c_c2, next_c_c3 = self.get_parameters()
        new_score = self.evaluate_params([setpoint], max_temp[0], next_c1, next_c2, next_c3, next_c_c1,
                                         next_c_c2,
                                         next_c_c3)
        return False, new_score

    def get_parameters(self) -> tuple[float, float, float, float | None, float | None, float | None]:
        """get new curve parameters"""

        self.trial = self.study.ask()

        if "hybrid" in self.type_name:
            next_c1 = self.trial.suggest_float("c1", self.constrains["heating"]["c1_min"],
                                               self.constrains["heating"]["c1_max"])
            next_c2 = self.trial.suggest_float("c2", self.constrains["heating"]["c2_min"],
                                               self.constrains["heating"]["c2_max"])
            next_c3 = self.trial.suggest_float("c3", self.constrains["heating"]["c3_min"],
                                               self.constrains["heating"]["c3_max"])
            next_cooling_c1 = self.trial.suggest_float("hybrid_c1", self.constrains["cooling"]["c1_min"],
                                                       self.constrains["cooling"]["c1_max"])
            next_cooling_c2 = self.trial.suggest_float("hybrid_c2", self.constrains["cooling"]["c2_min"],
                                                       self.constrains["cooling"]["c2_max"])
            next_cooling_c3 = self.trial.suggest_float("hybrid_c3", self.constrains["cooling"]["c3_min"],
                                                       self.constrains["cooling"]["c3_max"])
            return next_c1, next_c2, next_c3, next_cooling_c1, next_cooling_c2, next_cooling_c3

        next_c1 = self.trial.suggest_float(
            "c1", self.constrains["c1_min"], self.constrains["c1_max"])
        next_c2 = self.trial.suggest_float(
            "c2", self.constrains["c2_min"], self.constrains["c2_max"])
        next_c3 = self.trial.suggest_float(
            "c3", self.constrains["c3_min"], self.constrains["c3_max"])
        return next_c1, next_c2, next_c3, None, None, None

    def load_parameters_from_best_trial(self) -> None:
        """load curve parameters from best trial"""

        self.c1 = self.best_trial["params"]["c1"]
        self.c2 = self.best_trial["params"]["c2"]
        self.c3 = self.best_trial["params"]["c3"]
        self.hybrid_c1 = self.best_trial["params"]["hybrid_c1"]
        self.hybrid_c2 = self.best_trial["params"]["hybrid_c2"]
        self.hybrid_c3 = self.best_trial["params"]["hybrid_c3"]

    def load_parameters(self, setpoint: float, max_temp: list[float]) -> None:
        """load parameters from the file system or from initial parameters"""

        old_params = self.load_best_params_if_they_exist()
        if old_params is not None:
            self.best_trial = {
                "params": {
                    "c1": old_params["params"]["c1"],
                    "c2": old_params["params"]["c2"],
                    "c3": old_params["params"]["c3"],
                    "hybrid_c1": old_params["params"]["hybrid_c1"],
                    "hybrid_c2": old_params["params"]["hybrid_c2"],
                    "hybrid_c3": old_params["params"]["hybrid_c3"]
                },
                "hit_setpoint_score": old_params["hit_setpoint_score"],
                "parameters_score": old_params["parameters_score"],
                "best_parameters_found": old_params["best_parameters_found"]
            }

            self.load_parameters_from_best_trial()

            self.study_finished = self.best_trial["best_parameters_found"]
        else:
            if "hybrid" in self.type_name:
                self.best_trial = {
                    "params": {
                        "c1": SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c1"],
                        "c2": SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c2"],
                        "c3": SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c3"],
                        "hybrid_c1": SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["hybrid_c1"],
                        "hybrid_c2": SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["hybrid_c2"],
                        "hybrid_c3": SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["hybrid_c3"]
                    },
                    "hit_setpoint_score": 0,
                    "parameters_score": self.evaluate_params(
                        [setpoint],
                        max_temp[0],
                        SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c1"],
                        SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c2"],
                        SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c3"],
                        SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["hybrid_c1"],
                        SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["hybrid_c2"],
                        SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["hybrid_c3"]
                    ),
                    "best_parameters_found": False
                }
                self.load_parameters_from_best_trial()
            else:
                self.best_trial = {
                    "params": {
                        "c1": SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c1"],
                        "c2": SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c2"],
                        "c3": SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c3"],
                        "hybrid_c1": None,
                        "hybrid_c2": None,
                        "hybrid_c3": None
                    },
                    "hit_setpoint_score": 0,
                    "parameters_score": self.evaluate_params(
                        [setpoint],
                        max_temp[0],
                        SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c1"],
                        SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c2"],
                        SETPOINT_OPTIMIZER_INITIAL_PARAMETERS[self.type_name]["c3"]),
                    "best_parameters_found": False
                }
                self.c1 = self.best_trial["params"]["c1"]
                self.c2 = self.best_trial["params"]["c2"]
                self.c3 = self.best_trial["params"]["c3"]

    def optimize(self, outdoor_temp_values: np.array, current_set_temperature: list[float],
                 room_temperature_value: np.array, solar_radiation: np.array,
                 room_set_temp: list[float], room_set_temp2: list[float], min_set_temp: float,
                 max_set_temp: float, operation_mode: int, schedule: dict[str, str], timezone: str) -> np.array:
        """predict controller values using current parameters"""

        result = np.zeros(len(outdoor_temp_values))

        for i, outdoor_temp_val in enumerate(outdoor_temp_values):
            if timezone == "":
                timezone = "Europe/Vienna"

            tz = pytz.timezone(timezone)
            date = datetime.datetime.now(tz=tz)
            hour = date.hour
            minute = date.minute
            now = f"{hour}:{minute}"
            n = datetime.datetime.strptime(now, "%H:%M")

            in_high_phase = False

            if schedule is None:
                in_high_phase = True
            else:
                start = datetime.datetime.strptime(schedule["start"], "%H:%M")
                end = datetime.datetime.strptime(schedule["end"], "%H:%M")
                if start <= n <= end:
                    in_high_phase = True

            room_set_temperature = (room_set_temp[i] * in_high_phase) + (
                (room_set_temp2[i]) * (not in_high_phase))

            if (room_set_temp[i] < outdoor_temp_val) and ("heating" in self.type_name):
                result[i] = min_set_temp

            elif (room_set_temp[i] > outdoor_temp_val) and ("cooling" in self.type_name):
                result[i] = max_set_temp
            else:
                future_setpoints = []
                for temp in outdoor_temp_values[i:(i + 24):4]:
                    future_res = self.get_new_setpoint(temp, room_temperature_value[i],
                                                       current_set_temperature[i], solar_radiation[i],
                                                       room_set_temperature, min_set_temp, max_set_temp,
                                                       operation_mode)
                    future_setpoints.append(future_res)
                if self.since_off_state == 0:
                    result[i] = max(
                        float(np.mean(future_setpoints)), min_set_temp)
                    continue

                if "hybrid" in self.name:
                    if operation_mode == 2:
                        future_setpoint = self.smoothen_output(
                            float(np.mean(future_setpoints)), max_set_temp)
                    else:
                        future_setpoint = self.smoothen_output(
                            float(np.mean(future_setpoints)), min_set_temp)
                else:
                    if "heating" in self.name:
                        future_setpoint = self.smoothen_output(
                            float(np.mean(future_setpoints)), min_set_temp)
                    elif "cooling" in self.name:
                        future_setpoint = self.smoothen_output(
                            float(np.mean(future_setpoints)), max_set_temp)
                    else:
                        future_setpoint = 0

                result[i] = max(min_set_temp, future_setpoint)
        return result

    def smoothen_output(self, prediction: float, min_temp: float) -> float:
        """gradually change the system output"""

        n = [min_temp] * self.since_off_state + [prediction] * \
            ((self.smoothness + 1) - self.since_off_state)
        self.since_off_state -= 1
        return float(np.mean(n))

    def get_new_setpoint(self, outdoor_temp_value: float, room_temperature_value: float, current_set_temperature: float,
                         solar_radiation: float, current_room_set_temperature: float, min_set_temp: float,
                         max_set_temp: float,
                         operation_mode: int) -> float:
        """get new controller values for the heating elements"""

        self.smoothness = 5
        operation_type = self.type_name

        if operation_mode == 0:
            self.since_off_state = self.smoothness

            if self.hybrid_operation_mode == "heating":
                return min_set_temp
            elif self.hybrid_operation_mode == "cooling":
                return max_set_temp
            return min_set_temp
        self.hybrid_operation_mode = operation_mode

        if "hybrid" in self.type_name:
            if operation_mode == 1:
                operation_type = "heating"
            elif operation_mode == 2:
                operation_type = "cooling"

        if "heating" in operation_type:
            if current_room_set_temperature < outdoor_temp_value:
                self.since_off_state = self.smoothness
                return min_set_temp

            if (current_room_set_temperature + 0.5) <= room_temperature_value:
                self.above_set_temperature = True
                self.since_off_state = self.smoothness
                return min_set_temp

            if current_set_temperature < outdoor_temp_value:
                self.since_off_state = self.smoothness
                return min_set_temp

            if self.above_set_temperature and (room_temperature_value > current_room_set_temperature):
                self.since_off_state = self.smoothness
                return min_set_temp

        elif "cooling" in operation_type:
            if (current_room_set_temperature - 0.5) >= room_temperature_value:
                self.above_set_temperature = True
                self.since_off_state = self.smoothness
                return max_set_temp

            if self.above_set_temperature and (room_temperature_value < current_room_set_temperature):
                self.since_off_state = self.smoothness
                return max_set_temp

        self.above_set_temperature = False

        if "cooling" in operation_type:
            gamma = 1 + (solar_radiation / 10 ** 4)
            max_deviation = 2
            if outdoor_temp_value < current_room_set_temperature:
                percentage = 1 / max_deviation * \
                    ((current_room_set_temperature + 1) - outdoor_temp_value)
                gamma = max(1.0, min(1.11, percentage ** 0.05))

            gamma = (2 + gamma) / 3
        else:
            gamma = 1 - (solar_radiation / 10 ** 4)
            max_deviation = 2
            if (current_room_set_temperature - max_deviation) < room_temperature_value <= (
                    current_room_set_temperature + 0.5):
                percentage = 1 / max_deviation * \
                    ((current_room_set_temperature + 0.5) - room_temperature_value)
                gamma = max(0.9, percentage ** 0.1)

            gamma = (1 + gamma) / 2

        if "heating" in operation_type:
            res = self.get_heating_setpoint(current_set_temperature, outdoor_temp_value, self.c1, self.c2,
                                            self.c3)
            result = min(max(min_set_temp,
                             res * gamma), max_set_temp)
        elif "cooling" in operation_type:
            if "hybrid" in self.type_name:
                res = self.get_cooling_setpoint(max_set_temp, room_temperature_value,
                                                self.hybrid_c1,
                                                self.hybrid_c2,
                                                self.hybrid_c3)
                result = max(min(max_set_temp, res * gamma), min_set_temp)
            else:
                result = max(min(max_set_temp,
                                 self.get_cooling_setpoint(max_set_temp,
                                                           room_temperature_value, self.c1, self.c2,
                                                           self.c3)), min_set_temp)
        else:
            return min_set_temp
        return result

    @staticmethod
    def get_heating_setpoint(current_set_temperature: float, outdoor_temp_value: np.array,
                             c1: float, c2: float, c3: float) -> np.array:
        """compute the new optimized flow temperature for controlling and various room temperatures"""

        return current_set_temperature + (
            c1 * np.real((current_set_temperature - outdoor_temp_value).astype(complex) ** (1 / c3))) + c2

    @staticmethod
    def get_cooling_setpoint(max_temp: float, room_temp: np.array,
                             c1: float, c2: float, c3: float) -> np.array:
        """compute the new optimized flow temperature for controlling and various room temperatures"""

        return max_temp - (
            c1 * np.real((room_temp - max_temp).astype(complex) ** (1 / c3))) - c2

    def evaluate(
            self, room_temperature: pd.Series, max_temp: list[float], setpoint: list[float],
            flow_temperature: pd.Series, return_temperature: pd.Series,
            states: pd.Series, alpha: float) -> tuple[float, float, float]:
        """compute scores for the current parameters"""

        room_temperature_np = np.array(room_temperature)
        setpoint_np = np.array(setpoint).astype(float)
        states_np = np.array(states)
        max_temp_np = np.array(max_temp)

        flow_temperature_np = np.array(flow_temperature)

        return_temperature_np = None
        if return_temperature is not None:
            return_temperature_np = np.array(return_temperature)

        to_delete_index = []

        phase_indices = {}

        for i, room_temp in enumerate(room_temperature_np):
            if "hybrid" in self.name:
                if states_np[i] == 1:
                    if room_temp >= setpoint_np[i]:
                        to_delete_index.append(i)
                elif states_np[i] == 2:
                    if room_temp <= setpoint_np[i]:
                        to_delete_index.append(i)
            elif "cooling" in self.name:
                if room_temp <= setpoint_np[i]:
                    to_delete_index.append(i)
            elif "heating" in self.name:
                if room_temp >= setpoint_np[i]:
                    to_delete_index.append(i)

        np.delete(room_temperature_np, to_delete_index)
        np.delete(flow_temperature_np, to_delete_index)
        np.delete(setpoint_np, to_delete_index)
        np.delete(max_temp_np, to_delete_index)

        if return_temperature_np is not None:
            np.delete(return_temperature_np, to_delete_index)

        for sp in set(setpoint_np):
            phase_indices[sp] = []

        for i, room_temp in enumerate(room_temperature_np):
            phase_indices[setpoint_np[i]].append(room_temp)

        score = []

        for key, value in phase_indices.items():
            score.append(
                1 / len(value) * sum(
                    (np.array(value) - np.array(key)) ** 2) * alpha
            )
        score = 1 / len(room_temperature_np) * sum(
            (np.array(room_temperature_np) - np.array(setpoint_np)) ** 2) * alpha

        self.setpoint_hit_score = score

        score2 = self.evaluate_params(np.array(setpoint_np), max_temp_np[0], self.c1, self.c2, self.c3, self.hybrid_c1,
                                      self.hybrid_c2,
                                      self.hybrid_c3)

        return score + score2, score, score2

    def evaluate_params(self, current_set_temperature: Union[list[float], np.array], max_temp: float,
                        c1: float, c2: float, c3: float,
                        c_c1: float | None = None, c_c2: float | None = None, c_c3: float | None = None) -> float:
        """evaluate a score for the current parameters"""

        heating_space = np.linspace(-10, 10)
        cooling_space = np.linspace(max_temp, 30)

        if "heating" in self.name:
            output = self.get_heating_setpoint(
                current_set_temperature[0], heating_space, c1, c2, c3)
        elif "cooling" in self.name:
            output = 50 - self.get_cooling_setpoint(
                max_temp, cooling_space, c1, c2, c3)
        else:
            heating_output = self.get_heating_setpoint(
                current_set_temperature[0], heating_space, c1, c2, c3)
            if not np.any([c_c1, c_c2, c_c3]):
                cooling_output = 0
            else:

                cooling_output = 50 - self.get_cooling_setpoint(max_temp, cooling_space, c_c1,
                                                                c_c2, c_c3)
            output = heating_output + cooling_output

        return float(np.mean(output)) * (1 - self.alpha)

    def evaluate_performance(self, room_temperature: pd.Series, max_temp: list[float], setpoint: list[float],
                             flow_temperature: pd.Series, return_temperature: pd.Series, states: pd.Series,
                             study_name: str) -> None:
        """evaluate the performance of the current curve"""

        if self.trial is None and not self.study_finished:
            raise ValueError(
                "no parameters have been suggested yet, use self.update_parameters first before evaluating")

        if not self.study_finished:
            score_total, score1, score2 = self.evaluate(room_temperature, max_temp, setpoint, flow_temperature,
                                                        return_temperature, states, self.alpha)
            self.study.tell(self.trial, score_total)

            logging.info("saving study %s", study_name)
            try:
                self.save_study()

                if not self.are_best_params_present():
                    self.best_trial = {
                        "params": {
                            "c1": self.c1,
                            "c2": self.c2,
                            "c3": self.c3,
                            "hybrid_c1": self.hybrid_c1,
                            "hybrid_c2": self.hybrid_c2,
                            "hybrid_c3": self.hybrid_c3
                        },
                        "hit_setpoint_score": score1,
                        "parameters_score": score2,
                        "best_parameters_found": False
                    }
                    self.save_best_params()
                elif self.best_trial is None and self.are_best_params_present():
                    pass
                else:
                    old_params = self.load_best_params_if_they_exist()
                    if old_params is None:
                        return
                    new_trial = {
                        "params": {
                            "c1": self.c1,
                            "c2": self.c2,
                            "c3": self.c3,
                            "hybrid_c1": self.hybrid_c1,
                            "hybrid_c2": self.hybrid_c2,
                            "hybrid_c3": self.hybrid_c3
                        },
                        "hit_setpoint_score": score1,
                        "parameters_score": score2,
                        "best_parameters_found": self.study_finished
                    }
                    if old_params["hit_setpoint_score"] >= score1 and old_params["parameters_score"] > score2:
                        self.best_trial = new_trial
                        self.save_best_params()
            except Exception as e:
                logging.error(
                    "error occurred while saving the study %s: %s", study_name, repr(e))

        else:
            new_trial = {
                "params": {
                    "c1": self.c1,
                    "c2": self.c2,
                    "c3": self.c3,
                    "hybrid_c1": self.hybrid_c1,
                    "hybrid_c2": self.hybrid_c2,
                    "hybrid_c3": self.hybrid_c3
                },
                "hit_setpoint_score": self.best_trial["hit_setpoint_score"],
                "parameters_score": self.best_trial["parameters_score"],
                "best_parameters_found": self.study_finished
            }
            self.best_trial = new_trial
            self.save_best_params()

    @staticmethod
    def store_setpoint_optimizer_study_to_s3(study: optuna.study.study.Study, model_id: str, system: str) -> None:
        """save the study in S3"""

        store_to_s3(get_ai_bucket_name(), get_setpoint_optimizer_study_key(model_id, system),
                    study, StoreMode.CREATE_AND_UPDATE)

    @staticmethod
    def does_study_exist_in_s3(model_id: str, system: str) -> bool:
        """does study exist in S3"""

        does_study_exist = does_key_exist(get_ai_bucket_name(
        ), get_setpoint_optimizer_study_key(model_id, system))
        if does_study_exist:
            study = Curve.load_study_from_s3(model_id, system)
            if '_directions' in study.__dict__:
                # version 3
                return True
            else:
                # version 2
                return False
        else:
            return False

    @staticmethod
    def load_study_from_s3(model_id: str, system: str) -> optuna.study.study.Study:
        """load study from S3"""

        study = load_from_s3(get_ai_bucket_name(
        ), get_setpoint_optimizer_study_key(model_id, system))
        if isinstance(study, optuna.study.study.Study):
            return study
        else:
            raise ValueError()

    @staticmethod
    def store_setpoint_optimizer_best_params_to_s3(best_params: dict, model_id: str, system: str) -> None:
        """save best parameters in S3"""

        store_to_s3(get_ai_bucket_name(), get_setpoint_optimizer_best_params_key(model_id, system),
                    best_params, StoreMode.CREATE_AND_UPDATE)

    @staticmethod
    def do_best_params_exist_in_s3(model_id: str, system: str) -> bool:
        """do best params exist in S3"""

        return does_key_exist(get_ai_bucket_name(), get_setpoint_optimizer_best_params_key(model_id, system))

    @staticmethod
    def load_best_params_from_s3(model_id: str, system: str) -> dict:
        """load study from S3"""

        best_params = load_from_s3(get_ai_bucket_name(
        ), get_setpoint_optimizer_best_params_key(model_id, system))
        if isinstance(best_params, dict):
            return best_params
        else:
            raise ValueError()
