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
    Kp=ParameterConfig(initial_value=0.0, limits=(0.0, 0.4), step=0.1),
    Ki=ParameterConfig(initial_value=0.0, limits=(0, 10), step=2),
    Kd=ParameterConfig(initial_value=0.00, limits=(0, 0.002), step=0.001), )


class PidController:
    """controller to regulate the indoor temperature"""

    def __init__(self,
                 setpoint: BehaviorSubject[float] = BehaviorSubject(22.0),
                 output_limits: tuple[float, float] = (0, 1),
                 optimization: bool = False):
        # set parameters
        self._Kp = BehaviorSubject(HEATING_WATER_CONSTANTS.Kp.initial_value)
        self._Ki = BehaviorSubject(HEATING_WATER_CONSTANTS.Ki.initial_value)
        self._Kd = BehaviorSubject(HEATING_WATER_CONSTANTS.Kd.initial_value)

        self._setpoint = setpoint
        self._output_limits = output_limits

        self.new_pid()

        self._setpoint.pipe(ops.combine_latest(self._Kp, self._Ki, self._Kd)).subscribe(self._set_pid)

        self._optimization = optimization
        self._study = None

    def new_pid(self):
        """Make new PID"""
        self._pid = PID(Kp=self._Kp, Ki=self._Ki, Kd=self._Kp, setpoint=self._setpoint, sample_time=None,
                        output_limits=self._output_limits, auto_mode=True,
                        proportional_on_measurement=True,
                        differential_on_measurement=False, error_map=None, time_fn=None,
                        starting_output=mean(self._output_limits))

    def _set_pid(self, x):
        self._pid.tunings = (x[1], x[2], x[3])
        self._pid.setpoint = x[0]

    def compute_output(self, x: float, dt: float):
        return self._pid(x)

    def start_optimization(self, check_score_with_new_params: Callable[[PidController], float],
                           n_trials: int):
        if self.is_optimization_running():
            print("Study is already runnning")
            return

        self._study: Study = create_study(direction=StudyDirection.MAXIMIZE)

        self._study.enqueue_trial({
            'Kp': HEATING_WATER_CONSTANTS.Kp.initial_value,
            'Ki': HEATING_WATER_CONSTANTS.Ki.initial_value,
            'Kd': HEATING_WATER_CONSTANTS.Kd.initial_value,
        })

        self._optimization = True

        def run_one_iteration(trial: Trial) -> float:
            """set new parameters and then evaluate the controller with the passed function"""

            self.set_new_params(trial)
            return check_score_with_new_params(self)

        self._study.optimize(run_one_iteration, n_trials=n_trials)

        self.stop_optimization()

        # https://optuna.readthedocs.io/en/stable/tutorial/20_recipes/007_optuna_callback.html

    def is_optimization_running(self):
        return self._optimization

    def stop_optimization(self):
        self._Kp.on_next(self._study.best_params['Kp'])
        self._Ki.on_next(self._study.best_params['Ki'])
        self._Kd.on_next(self._study.best_params['Kd'])

        del self._study
        self._study = None
        self._optimization = False

    def print_current_params(self):
        """print the current parameters"""
        print(f'Kp: {self._Kp.value}')
        print(f'Ki: {self._Ki.value}')
        print(f'Kd: {self._Kd.value}')

    def set_new_params(self, trial: Trial):
        """set new controller parameters within the current trial"""
        self._Kp.on_next(
            trial.suggest_float('Kp', *HEATING_WATER_CONSTANTS.Kp.limits, step=HEATING_WATER_CONSTANTS.Kp.step))
        self._Ki.on_next(
            trial.suggest_float('Ki', *HEATING_WATER_CONSTANTS.Ki.limits, step=HEATING_WATER_CONSTANTS.Ki.step))
        self._Kd.on_next(
            trial.suggest_float('Kd', *HEATING_WATER_CONSTANTS.Kd.limits, step=HEATING_WATER_CONSTANTS.Kd.step))
