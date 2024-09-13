from __future__ import annotations

from dataclasses import dataclass
from statistics import mean
from typing import Callable

import reactivex.operators as ops
from optuna import Study, create_study
from optuna.study import StudyDirection
from optuna.trial import Trial
from reactivex.subject import BehaviorSubject
from simple_pid import PID

from common_utils import ControlType


@dataclass(frozen=True, order=True, kw_only=True)
class ParameterConfig:
    """structure for parameters"""
    initial_value: float
    limits: tuple[float, float]
    step: float


@dataclass(frozen=True, order=True, kw_only=True)
class ControlConstants:
    """structure for PID controller parameters"""
    Kp: ParameterConfig
    Ki: ParameterConfig
    Kd: ParameterConfig


"""constants for heating systems"""
HEATING_WATER_CONSTANTS = ControlConstants(
    Kp=ParameterConfig(initial_value=0.2, limits=(0.1, 0.4), step=0.1),
    Ki=ParameterConfig(initial_value=6.0, limits=(6, 10), step=2),
    Kd=ParameterConfig(initial_value=0.002, limits=(0, 0.002), step=0.001), )

"""constants for cooling systems"""
COOLING_WATER_CONSTANTS = ControlConstants(
    Kp=ParameterConfig(initial_value=0.8, limits=(0, 20), step=2),
    Ki=ParameterConfig(initial_value=8.4, limits=(0, 20), step=2),
    Kd=ParameterConfig(initial_value=0.0, limits=(0, 20), step=2), )


class PidController:
    """controller to regulate the indoor temperature"""

    def __init__(self, setpoint: BehaviorSubject[float], output_limits: tuple[float, float],
                 controller_type: ControlType, config: dict):
        self._controller_type = controller_type
        self._config = config
        match self._controller_type:
            case ControlType.HEATING:
                self._Kp = BehaviorSubject(HEATING_WATER_CONSTANTS.Kp.initial_value)
                self._Ki = BehaviorSubject(HEATING_WATER_CONSTANTS.Ki.initial_value)
                self._Kd = BehaviorSubject(HEATING_WATER_CONSTANTS.Kd.initial_value)
            case ControlType.COOLING:
                self._Kp = BehaviorSubject(COOLING_WATER_CONSTANTS.Kp.initial_value)
                self._Ki = BehaviorSubject(COOLING_WATER_CONSTANTS.Ki.initial_value)
                self._Kd = BehaviorSubject(COOLING_WATER_CONSTANTS.Kd.initial_value)
            case _:
                raise ValueError
        self._setpoint = setpoint
        self._output_limits = output_limits

        self.init_pid()

        self._setpoint.pipe(
            ops.combine_latest(self._Kp, self._Ki, self._Kd),
        ).subscribe(self._set_pid)

        if self._config.get("study_name"):
            self._study: Study = create_study(direction=StudyDirection.MAXIMIZE, storage="sqlite:///db.sqlite3",
                                              study_name=self._config.get("study_name"))
            self._study.enqueue_trial({
                'Kp': HEATING_WATER_CONSTANTS.Kp.initial_value,
                'Ki': HEATING_WATER_CONSTANTS.Ki.initial_value,
                'Kd': HEATING_WATER_CONSTANTS.Kd.initial_value,
            })

        else:
            self._study: Study = create_study(direction=StudyDirection.MAXIMIZE)

    def init_pid(self):
        """Initialize or reset PID"""
        self._pid = PID(Kp=self._Kp, Ki=self._Ki, Kd=self._Kp, setpoint=self._setpoint, sample_time=None,
                        output_limits=self._output_limits, auto_mode=True,
                        proportional_on_measurement=True,
                        differential_on_measurement=False, error_map=None, time_fn=None,
                        starting_output=mean(self._output_limits))

    def _set_pid(self, x):
        self._pid.tunings = (x[1], x[2], x[3])
        self._pid.setpoint = x[0]

    def set_new_params(self, trial: Trial):
        """set new controller parameters within the current trial"""
        match self._controller_type:
            case ControlType.HEATING:
                self._Kp.on_next(
                    trial.suggest_float('Kp', *HEATING_WATER_CONSTANTS.Kp.limits, step=HEATING_WATER_CONSTANTS.Kp.step))
                self._Ki.on_next(
                    trial.suggest_float('Ki', *HEATING_WATER_CONSTANTS.Ki.limits, step=HEATING_WATER_CONSTANTS.Ki.step))
                self._Kd.on_next(
                    trial.suggest_float('Kd', *HEATING_WATER_CONSTANTS.Kd.limits, step=HEATING_WATER_CONSTANTS.Kd.step))
            case ControlType.COOLING:
                self._Kp.on_next(
                    trial.suggest_float('Kp', *COOLING_WATER_CONSTANTS.Kp.limits, step=COOLING_WATER_CONSTANTS.Kp.step))
                self._Ki.on_next(
                    trial.suggest_float('Ki', *COOLING_WATER_CONSTANTS.Ki.limits, step=COOLING_WATER_CONSTANTS.Ki.step))
                self._Kd.on_next(
                    trial.suggest_float('Kd', *COOLING_WATER_CONSTANTS.Kd.limits, step=COOLING_WATER_CONSTANTS.Kd.step))
            case _:
                raise ValueError

    def optimize_params(self, check_score_with_new_params: Callable[[PidController], float], n_trials: int):
        """optimize the parameters of the PID controller and then set the best found values"""

        def run_one_iteration(trial: Trial) -> float:
            """set new parameters and then evaluate the controller with the passed function"""

            if self._config.get("optimize"):
                self.set_new_params(trial)
            return check_score_with_new_params(self)

        self._study.optimize(run_one_iteration, n_trials=n_trials)

        if self._config.get("optimize"):
            self._Kp.on_next(self._study.best_params['Kp'])
            self._Ki.on_next(self._study.best_params['Ki'])
            self._Kd.on_next(self._study.best_params['Kd'])

    def compute_output(self, temperature: float, dt: float):
        """computes a new controller output for the current indoor temperature"""
        return self._pid(temperature)

    def print_current_params(self):
        """print the current parameters"""
        print(f'Kp: {self._Kp.value}')
        print(f'Ki: {self._Ki.value}')
        print(f'Kd: {self._Kd.value}')
