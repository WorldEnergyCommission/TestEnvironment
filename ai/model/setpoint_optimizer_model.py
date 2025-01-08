from __future__ import annotations

import datetime
import logging
import numbers
import traceback

import numpy as np
import pandas as pd
import pytz

from ai.data_holder.setpoint_optimizer_data_holder import SetpointOptimizerDataHolder
from ai.interface.model import Model
from ai.preprocessing.setpoint_optimizer_preprocessing import get_setpoint_optimizer_features, \
    preprocess_setpoint_optimizer_data
from ai.utils.control_type_utils import ControlType
from ai.utils.curve_utils import Curve
from ai.utils.http_utils import fetch_last_value
from ai.utils.pid_controller_utils import PidController
from ai.utils.reward_function_utils import get_squared_error_reward_config
from ai.utils.s3_utils import VersionedClass
from ai.utils.setpoint_function_utils import get_weekly_temperature_config_constant
from ai.utils.setpoint_optimizer_function_utils import ready_to_turn_off, ready_to_turn_off_pid
from ai.utils.smoothing_function_utils import get_mean_smoothing_function
from ai.utils.time_utils import get_current_datetime_in_tz, get_most_recent_timestamp_from_df


class SetpointOptimizerModel(Model, VersionedClass):
    def __init__(self, model_id: str, project_id: str) -> None:
        """inits the model

        :param model_id: unique identifier of the model
        :param project_id: unique identifier of the project
        """

        self.heating_water_curves: dict[str, Curve | PidController] = {}
        self.heating_air_curves: dict[str, Curve | PidController] = {}
        self.cooling_water_curves: dict[str, Curve | PidController] = {}
        self.cooling_air_curves: dict[str, Curve | PidController] = {}
        self.hybrid_water_curves: dict[str, Curve | PidController] = {}
        self.hybrid_air_curves: dict[str, Curve | PidController] = {}

        self.model_id = model_id
        self.project_id = project_id

        self.turned_off = False

        super().__init__()

    @classmethod
    def class_dict_adaptions(cls, version: int, class_dict: dict[str, ...]) -> dict[str, ...]:
        """modifications based on version"""

        return class_dict

    @property
    def version(self) -> int:
        """the current version"""

        return 1

    def fit(self, dh: SetpointOptimizerDataHolder, _: object) -> None:
        """fits the model

        :param dh: data holder
        :param _: not used parameter
        """

        # get the features and check if the optimizer is next generation
        x = get_setpoint_optimizer_features(dh)
        is_next_generation = dh.is_setpoint_optimizer_next_generation()

        # generate the controller for each system
        for type_name in ["heating_water", "heating_air", "cooling_water", "cooling_air", "hybrid_water", "hybrid_air"]:
            for sys in x[type_name]:
                # generate the correct controller
                controller: Curve | PidController
                if is_next_generation:
                    controller = PidController(control_type=ControlType(type_name))
                    controller: PidController
                    controller.start_optimization(
                        reward_config=get_squared_error_reward_config(),
                        optimization_trials=14,
                        optimization_trial_seconds=12 * 60 * 60,
                        study_title=f'{self.project_id}/{self.model_id}/{sys}',
                        storage=None)
                else:
                    controller = Curve(sys, self.model_id, sys, type_name, 0.99, project_id=self.project_id)
                    controller: Curve

                # add controller to the model
                if type_name == "heating_water":
                    self.heating_water_curves[sys] = controller
                elif type_name == "heating_air":
                    self.heating_air_curves[sys] = controller
                elif type_name == "cooling_water":
                    self.cooling_water_curves[sys] = controller
                elif type_name == "cooling_air":
                    self.cooling_air_curves[sys] = controller
                elif type_name == "hybrid_water":
                    self.hybrid_water_curves[sys] = controller
                elif type_name == "hybrid_air":
                    self.hybrid_air_curves[sys] = controller
                else:
                    raise ValueError

    @staticmethod
    def compute_new_set_temperatures(
            x: pd.DataFrame, y: dict[str, np.array], k: str, mode: int, curve: Curve,
            op_mode: str, min_temp: dict[str, float | dict[str, float]],
            max_temp: dict[str, float | dict[str, float]], room_set_temp: dict[str, float | dict[str, float]],
            room_set_temp2: dict[str, float | dict[str, float]], schedule: dict[str, str], timezone: str) -> None:
        """compute new set temperatures"""

        outdoor_temp = x["outdoor_temperature"].values
        room_temperature_avg = x[k + "_room_temperature_avg"].values
        solar_radiation = x["horizontal_radiation"].values
        current_set_temperature = [
                                      float(min_temp[k][op_mode]) - float(curve.c2)] * len(x)
        room_set_temp_high = [
                                 room_set_temp[k][op_mode]] * len(x)
        room_set_temp_low = [
                                room_set_temp2[k][op_mode]] * len(x)
        min_temperature = min_temp[k][op_mode]
        max_temperature = max_temp[k][op_mode]

        y[k] = curve.optimize(outdoor_temp, current_set_temperature,
                              room_temperature_avg, solar_radiation,
                              room_set_temp_high, room_set_temp_low, min_temperature,
                              max_temperature, mode, schedule, timezone)

    # noinspection PyMethodOverriding
    def predict(self, x: pd.DataFrame, min_temp: dict[str, float | dict[str, float]],
                max_temp: dict[str, float | dict[str, float]], room_set_temp: dict[str, float | dict[str, float]],
                room_set_temp2: dict[str, float | dict[str, float]], operation_mode: dict[str, str],
                schedules: dict[str, dict[str, str]],
                timezones: dict[str, str]) -> tuple[dict[str, np.array], dict[str, list[int | str]]]:
        """calculates new set temperatures for every connected temperature control system

        :param x: input feature of every temperature control system
        :param min_temp: holds information of every min flow temperature for every temperature control system
        :param max_temp: holds information of every max flow temperature for every temperature control system
        :param room_set_temp: holds information of every setpoint temperature for every temperature control system
        :param room_set_temp2: holds information of every low setpoint temperature for every temperature control system
        :param operation_mode: changes the optimization step
        :param schedules: holds information for the low energy time window
        :param timezones: timezone in which the control system operates
        """

        # common state variables
        y = {}
        states = {}
        countries: dict[str, str] = {}

        # do the prediction for each curve dict
        for key, system in self.__dict__.items():
            # only execute this code for curves
            if "_curves" not in key:
                continue

            # do the prediction for each curve
            for k, controller in system.items():

                # can bei either system
                controller: Curve | PidController

                # fetch the current mode and get the current setpoint temperature
                mode = int(fetch_last_value(
                    operation_mode[k], project_id=self.project_id))
                mode_str = SetpointOptimizerModel.convert_mode_int_to_str(mode)
                current_setpoint_temperature = SetpointOptimizerModel.get_value_for_system(k, room_set_temp, mode_str)

                # get the min and the max output temperature
                min_output_temperature = SetpointOptimizerModel.get_value_for_system(k, min_temp, mode_str)
                max_output_temperature = SetpointOptimizerModel.get_value_for_system(k, max_temp, mode_str)

                # get the most recent values of the most important columns
                current_room_temperature = SetpointOptimizerModel.get_current_value_from_df(
                    x, f'{k}_room_temperature_avg')
                current_outdoor_temperature = SetpointOptimizerModel.get_current_value_from_df(x, 'outdoor_temperature')
                current_solar_radiation = SetpointOptimizerModel.get_current_value_from_df(x, 'horizontal_radiation')

                # get all the values of the most important columns
                room_temperatures = x[k + "_room_temperature_avg"].values
                outdoor_temperatures = x["outdoor_temperature"].values
                solar_radiations = x["horizontal_radiation"].values

                # set the current timezone and the current country with default values
                timezone = timezones.get(k, 'Europe/Vienna')
                if timezone == '':
                    timezone = 'Europe/Vienna'
                country = countries.get(k, 'AT')

                # get the current datetime
                current_datetime = get_current_datetime_in_tz(timezone)

                if isinstance(controller, Curve):
                    # the controller is a curve
                    curve: Curve = controller

                    if k in schedules.keys():
                        schedule = schedules[k]
                    else:
                        schedule = None

                    if SetpointOptimizerModel.is_hybrid(k):
                        if mode == 1:
                            op_mode = "heating"
                            self.compute_new_set_temperatures(
                                x, y, k, mode, curve, op_mode, min_temp, max_temp,
                                room_set_temp, room_set_temp2, schedule, timezone)
                        elif mode == 2:
                            op_mode = "cooling"
                            self.compute_new_set_temperatures(
                                x, y, k, mode, curve, op_mode, min_temp, max_temp,
                                room_set_temp, room_set_temp2, schedule, timezone)
                        else:
                            op_mode = "heating"
                            self.compute_new_set_temperatures(
                                x, y, k, mode, curve, op_mode, min_temp, max_temp,
                                room_set_temp, room_set_temp2, schedule, timezone)

                    else:
                        date = datetime.datetime.now().astimezone(pytz.timezone('Europe/Vienna'))
                        index = len(x.loc[:date]) - 1
                        ready_to_turn_off_system = ready_to_turn_off(
                            x["outdoor_temperature"].values[index],
                            x[k + "_room_temperature_avg"].values[index],
                            x["horizontal_radiation"].values[index],
                            room_set_temp[k],
                            self.turned_off
                        )
                        self.turned_off = ready_to_turn_off_system

                        self.apply_turned_off_to_the_state(k, self.turned_off, states, self.project_id)

                        current_set_temperature = [
                                                      float(min_temp[k]) - float(curve.c2)] * len(x)
                        room_set_temp_high = [room_set_temp[k]] * len(x)
                        room_set_temp_low = [room_set_temp2[k]] * len(x)
                        min_temperature = min_temp[k]
                        max_temperature = max_temp[k]

                        y[k] = curve.optimize(outdoor_temperatures, current_set_temperature,
                                              room_temperatures, solar_radiations,
                                              room_set_temp_high, room_set_temp_low, min_temperature,
                                              max_temperature, mode, schedule, timezone)
                elif isinstance(controller, PidController):
                    # the controller is a pid controller
                    pid: PidController = controller

                    # compute if the controller should turn off and set that in the state
                    should_turn_off = ready_to_turn_off_pid(current_room_temperature, current_setpoint_temperature)
                    SetpointOptimizerModel.apply_turned_off_to_the_state(k, should_turn_off, states, self.project_id)

                    # compute the controller output, this function also trains the controller
                    controller_output = pid.get_output(
                        current_room_temperature,
                        current_datetime,
                        get_weekly_temperature_config_constant(
                            setpoint=current_setpoint_temperature,
                            country=country,
                            smoothing_function_config=get_mean_smoothing_function()
                        ))

                    # compute and set the boiler output temperature
                    output_array = np.zeros(len(room_temperatures))
                    output_temperature = SetpointOptimizerModel.get_output_temperature(
                        controller_output, pid.control_type,
                        min_output_temperature, max_output_temperature,
                        mode_str)
                    output_array[:] = output_temperature
                    y[k] = output_array
                else:
                    raise ValueError

        return y, states

    @staticmethod
    def get_output_temperature(
            controller_output: float, control_type: ControlType,
            min_output_temperature: float, max_output_temperature: float,
            mode_str: str) -> float:
        """convert the controller output to the output temperature"""

        output_temperature_range = max_output_temperature - min_output_temperature
        match control_type:
            case ControlType.HEATING_WATER | ControlType.HEATING_AIR:
                return min_output_temperature + output_temperature_range * controller_output
            case ControlType.COOLING_WATER | ControlType.COOLING_AIR:
                return max_output_temperature - output_temperature_range * controller_output
            case ControlType.HYBRID_WATER | ControlType.HYBRID_AIR if mode_str == 'heating':
                return min_output_temperature + output_temperature_range * controller_output
            case ControlType.HYBRID_WATER | ControlType.HYBRID_AIR if mode_str == 'cooling':
                return max_output_temperature - output_temperature_range * controller_output
            case _:
                raise ValueError

    @staticmethod
    def convert_mode_int_to_str(mode: int) -> str:
        """convert the mode int to a string"""

        if mode == 2:
            return 'cooling'
        else:
            return 'heating'

    @staticmethod
    def get_current_value_from_df(df: pd.DataFrame, column: str) -> float:
        """get the last value before the current timestamp of the specified column"""

        closest_time = get_most_recent_timestamp_from_df(df)
        closest_value = df.loc[closest_time, column]
        return float(closest_value)

    @staticmethod
    def is_hybrid(key: str) -> bool:
        """check if the passed key is from a hybrid system"""

        return 'hybrid' in key

    @staticmethod
    def get_value_for_system(
            curve_key: str, values: dict[str, float | dict[str, float]], operation_mode: str) -> float:
        """get the correct setpoint temperature"""

        if SetpointOptimizerModel.is_hybrid(curve_key):
            return values[curve_key][operation_mode]
        else:
            return values[curve_key]

    @staticmethod
    def apply_turned_off_to_the_state(
            curve_key: str, turn_off: bool, states: dict[str, list[int | str]], project_id: str) -> None:
        """update the state with a turn off signal for supported systems"""

        supported_curve_key_starts = [
            "heating_water"
        ]
        if not any(curve_key_start in curve_key for curve_key_start in supported_curve_key_starts):
            return
        states[curve_key] = [int(not turn_off), project_id]

    def update(self, x: pd.DataFrame, setpoint: dict[str, float | dict[str, dict[str, str | float]]],
               max_temps: dict[str, float], sys_type: str,
               timezone: dict[str, str]) -> dict[str, dict[str, float | bool | None]]:
        """evaluates the model performance on historic data and then changes its parameters"""

        params = {}
        for dict_key, value in self.__dict__.items():
            if sys_type + "_curves" in dict_key:
                for key, curve in value.items():
                    curve: Curve
                    room_temp = x[key + "_room_temperature_avg"]
                    flow_temp = x[key + "_flow_temperature"]
                    return_temp = None
                    if key + "_return_temperature" in x.keys():
                        return_temp = x[key + "_return_temperature"]
                    states = x[key + "_status"]

                    if isinstance(setpoint[key], numbers.Number):
                        setpoint_temp = [setpoint[key]] * len(room_temp)
                    else:
                        setpoint_temp = []
                        for i, v in x.iterrows():
                            # noinspection PyUnresolvedReferences
                            ind = i.to_pydatetime()
                            day = ind.date().strftime("%A").lower()

                            start = datetime.datetime.strptime(
                                setpoint[key][day]['start'], "%H:%M")
                            end = datetime.datetime.strptime(
                                setpoint[key][day]['end'], "%H:%M")

                            hour = ind.hour
                            minutes = ind.minute
                            now = datetime.datetime.strptime(
                                f"{hour}:{minutes}", "%H:%M")
                            setpoint_temp.append(
                                setpoint[key][day]["high_setpoint"] if start < now < end else setpoint[key][day][
                                    "low_setpoint"])

                    max_temp = [max_temps[key]] * len(room_temp)
                    try:
                        curve.evaluate_performance(
                            room_temp,
                            max_temp,
                            setpoint_temp,
                            flow_temp,
                            return_temp,
                            states,
                            study_name=curve.study.study_name
                        )
                    except Exception as e:
                        logging.error(f"error during performance evaluation: {repr(e)}")
                    try:
                        if isinstance(setpoint[key], numbers.Number):
                            params[key] = curve.update(
                                setpoint[key], max_temp)
                        else:
                            date = datetime.datetime.now(
                                tz=pytz.timezone(timezone[key]))
                            day = date.date().strftime("%A").lower()
                            params[key] = curve.update(
                                setpoint[key][day]["high_setpoint"], max_temp)
                    except Exception as e:
                        logging.error(f"error during update of setpoint optimizer: {repr(e)} {traceback.format_exc()}")

        return params

    def get_params(self, state: bool = False) -> dict[str, dict[str, float | bool | None]]:
        """extract the parameters from the curve"""

        params = {}
        for dict_key, system in self.__dict__.items():
            if "_curves" not in dict_key:
                continue

            for key, curve in system.items():
                params[key] = {
                    "c1": curve.c1,
                    "c2": curve.c2,
                    "c3": curve.c3,
                    "hybrid_c1": curve.hybrid_c1,
                    "hybrid_c2": curve.hybrid_c2,
                    "hybrid_c3": curve.hybrid_c3
                }
                if state:
                    params[key]["study_finished"] = curve.study_finished
        return params

    @staticmethod
    def train(dh: SetpointOptimizerDataHolder) -> SetpointOptimizerModel:
        """train a model with the passed data and return it"""

        model = SetpointOptimizerModel(dh.device_id, dh.project_id)
        model.fit(dh, None)
        return model

    @staticmethod
    def update_setpoint_optimizer(
            dh: SetpointOptimizerDataHolder, model: SetpointOptimizerModel,
            model_id: str) -> tuple[dict[str, dict[str, dict[str, float | bool | None]]], SetpointOptimizerModel]:
        """handles the bayesian learning process of the setpoint optimizer and returns the updated model"""

        try:
            ts0 = datetime.datetime.now()
            ts_start = int(ts0.timestamp() - 86400)
            ts_end = int(ts0.timestamp())

            x = dh.get_data(ts_start, ts_end, prediction=False)

            x = preprocess_setpoint_optimizer_data(
                x, dh.is_setpoint_optimizer_top())
            params = {}
            for i, v in dh.__dict__.items():
                # for every temperature control system, fetch the setpoints and
                # temperature restrictions to evaluate the performance of the model,
                # then update the parameters of the model according to the performance evaluation
                if "_systems" in i:
                    setpoints = {}
                    max_temps = {}
                    timezone = {}
                    for system in v:
                        if system.weekly_schedule_active:
                            if SetpointOptimizerModel.is_hybrid(system.identifier):
                                mode = fetch_last_value(
                                    system.status, dh.project_id)
                                if mode == 1:
                                    setpoints[system.identifier] = system.weekly_schedule
                                    max_temps[system.identifier] = system.max_flow_temperature["heating"]
                                else:
                                    setpoints[system.identifier] = system.weekly_schedule
                                    max_temps[system.identifier] = system.max_flow_temperature["cooling"]
                            else:
                                setpoints[system.identifier] = system.weekly_schedule
                                max_temps[system.identifier] = system.max_flow_temperature
                        else:
                            if SetpointOptimizerModel.is_hybrid(system.identifier):
                                mode = fetch_last_value(
                                    system.status, dh.project_id)
                                if mode == 1:
                                    setpoints[system.identifier] = system.set_point_temperature["heating"]
                                    max_temps[system.identifier] = system.max_flow_temperature["heating"]
                                else:
                                    setpoints[system.identifier] = system.set_point_temperature["cooling"]
                                    max_temps[system.identifier] = system.max_flow_temperature["cooling"]
                            else:
                                setpoints[system.identifier] = system.set_point_temperature
                                max_temps[system.identifier] = system.max_flow_temperature
                        timezone[system.identifier] = system.timezone

                    sys_type = i.replace("_systems", "")
                    params[model_id + "_" + sys_type] = model.update(
                        x, setpoints, max_temps, sys_type, timezone)
            return params, model

        except Exception as e:
            logging.error(f"setpoint optimizer update error: {repr(e)}")
