import abc
import uuid
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from typing import Callable

import optuna
from optuna import create_study, Trial
from optuna.study import StudyDirection

from ai.utils.setpoint_function_utils import get_setpoint_for_weekly_temperature_config_smoothed, \
    WeeklyTemperatureConfig


@dataclass(frozen=True, order=True, kw_only=True)
class ParameterValue:
    """
    structure for parameter values
    """

    name: str
    value: float


@dataclass(frozen=True, order=True, kw_only=True)
class ParameterConfig:
    """
    structure for parameter configs
    """

    name: str
    initial_value: float
    limits: tuple[float, float]
    step: float


@dataclass(order=True, kw_only=True)
class OptimizationRunTrial:
    """
    structure for optimization run stats
    """

    start_time: datetime
    end_time: datetime | None
    parameters: tuple[ParameterValue, ...]
    score: float
    optimization_trial_seconds: int


@dataclass(order=True, kw_only=True)
class OptimizationRunStat:
    """
    structure for optimization run stats
    """

    trials: dict[int, OptimizationRunTrial]


def get_random_id() -> str:
    """
    return a random id
    """

    return str(uuid.uuid4())


def get_value_by_parameter_name(parameter_values: tuple[ParameterValue, ...], name: str) -> float:
    """
    filters out the value for the name

    :param parameter_values: the parameter values
    :param name: the requested parameter name

    :returns: the returned value

    """
    filtered_parameter_values = [x for x in parameter_values if x.name == name]
    if len(filtered_parameter_values) == 0:
        raise RuntimeError
    elif len(filtered_parameter_values) == 1:
        return filtered_parameter_values[0].value
    else:
        raise RuntimeError


def get_finished_trials(trials: tuple[OptimizationRunTrial, ...]) -> tuple[OptimizationRunTrial, ...]:
    """
    filters out unfinished trials

    :param trials: the trials to filter

    :returns: the filtered trials

    """
    return tuple([trial for trial in trials if trial.end_time is not None])


class SetpointOptimizerInterface(abc.ABC):
    """
    the interface that is needed to run the setpoint optimizer in the ai module
    """

    def __init__(self,
                 parameter_configs: tuple[ParameterConfig, ...],
                 output_limits: tuple[float, float],
                 ) -> None:

        """
        creates the instance

        :param parameter_configs: the parameter configurations needed for the underlying model
        :param output_limits: the output limits for the underlying model
        """

        # stable properties
        self.output_limits = output_limits

        # changeable parameters but required for initial operation
        self.parameter_configs = None
        self.set_parameter_configs(parameter_configs)

        # optimization parameters that are not initially set
        self.reward_function = None
        self.study_direction = None
        self.optimization_trials = None
        self.optimization_trial_seconds = None
        self.study_title = None

        # properties to track the state
        self.optimization_run_stat_dict: dict[str, OptimizationRunStat] = defaultdict(
            lambda: OptimizationRunStat(
                trials={}))
        self.study: optuna.Study | None = None
        self.last_datetime: datetime | None = None
        self._current_setpoint_temperature = 0

    def set_parameter_configs(self, parameter_configs: tuple[ParameterConfig, ...]) -> None:
        """
        set the parameter config to different values

        :param parameter_configs: new configs
        """

        self.parameter_configs = parameter_configs

    def is_optimization_running(self) -> bool:
        """
        returns if the optimization is running

        :returns if the optimization is running
        """

        return self.study is not None

    def get_current_study_name(self) -> str:
        """
        returns the active study name

        :returns: the active study name
        """

        if not self.is_optimization_running():
            raise RuntimeError
        else:
            return self.study.study_name

    def get_current_stats(self) -> OptimizationRunStat:
        """
        returns the currently active stats

        :return: the currently used stats
        """
        current_study_name = self.get_current_study_name()
        if current_study_name not in self.optimization_run_stat_dict:
            raise RuntimeError
        else:
            return self.optimization_run_stat_dict[self.get_current_study_name()]

    def get_current_trial_number(self) -> int | None:
        """
        returns the currently active trial number or None

        :returns: the trial number or None
        """

        current_trials = self.get_current_stats().trials
        unfinished_trial_numbers = [trial_number for trial_number, trial in current_trials.items() if
                                    trial.end_time is None]
        if len(unfinished_trial_numbers) == 0:
            return None
        elif len(unfinished_trial_numbers) == 1:
            return unfinished_trial_numbers[0]
        else:
            raise RuntimeError

    def get_trial_by_number(self, trial_number: int) -> OptimizationRunTrial | None:
        """
        returns the trial by number or None

        :param trial_number: get the trial by its number

        :returns: the trial with that id or None
        """

        current_trials = self.get_current_stats().trials
        if trial_number in current_trials:
            return current_trials[trial_number]
        else:
            return None

    def get_current_trial(self) -> OptimizationRunTrial | None:
        """
        returns the currently active trial number or None

        :returns: the currently active trial
        """

        current_trial_number = self.get_current_trial_number()
        if current_trial_number is None:
            return None
        return self.get_trial_by_number(current_trial_number)

    def get_current_trial_parameters(self) -> tuple[ParameterValue, ...] | None:
        """
        returns the currently active trial parameters or None

        :returns: the currently active trial parameters
        """
        if self.get_current_trial():
            return self.get_current_trial().parameters
        else:
            return None

    def get_initial_parameter_values(self) -> tuple[ParameterValue, ...]:
        """
        get the correct initial parameter values

        :returns the initial parameter values for the configuration
        """

        return tuple(
            [ParameterValue(name=x.name, value=x.initial_value) for x in self.parameter_configs])

    def create_new_trial(self) -> None:
        """
        creates a new trial for the current stats
        """

        if not self.is_optimization_running():
            raise RuntimeError

        # reset the model internals to be able to start the trial from a fresh state
        self.reset_model()

        optuna_trial = self.study.ask()
        parameters = self.get_parameters_from_trial(optuna_trial)
        optimization_run_trial = OptimizationRunTrial(
            start_time=self.last_datetime, end_time=None,
            parameters=parameters, score=0,
            optimization_trial_seconds=0)
        self.get_current_stats().trials[optuna_trial.number] = optimization_run_trial

    def update_current_trial(self, score: float, dt_seconds: float) -> None:
        """
        updates the trial with the information gathered

        :param score: the score from the last step
        :param dt_seconds: the time that passed in that trial
        """

        current_trial = self.get_current_trial()
        if current_trial is None:
            raise RuntimeError
        # when the call frequency varies, the time difference must be incorporated in the score
        current_trial.score += score * dt_seconds / 60
        current_trial.optimization_trial_seconds += dt_seconds
        if current_trial.optimization_trial_seconds >= self.optimization_trial_seconds:
            self.study.tell(self.get_current_trial_number(), current_trial.score)
            current_trial.end_time = self.last_datetime

    def is_optimization_finished(self) -> bool:
        """
        this function checks if the optimization is finished, therefore if at least the required trials are finished

        :returns: if the optimization is finished
        """

        return len(get_finished_trials(tuple(self.get_current_stats().trials.values()))) >= self.optimization_trials

    def get_output(self,
                   mean_room_temperature: float,
                   current_datetime: datetime,
                   weekly_temperature_config: WeeklyTemperatureConfig) -> float:
        """
        gets the new controller output

        :param mean_room_temperature: the mean temperature of all temperature sensors
        :param current_datetime: datetime of current step with a timezone
        :param weekly_temperature_config: the requested temperature config

        :returns: the suggested boiler output temperature within the specified output limits
        """

        # compute the current dt in seconds from the last naive datetime
        if self.last_datetime is None:
            dt_seconds = None
        else:
            dt_seconds = (current_datetime - self.last_datetime).seconds
        # update the last naive datetime
        self.last_datetime = current_datetime
        # compute the setpoint temperature that is applicable for that datetime
        setpoint_temperature = get_setpoint_for_weekly_temperature_config_smoothed(
            weekly_temperature_config, current_datetime, self.is_optimization_running())
        if self.is_optimization_running():
            if self.get_current_trial() is None:
                # create a new trial and set the passed seconds to None to make a small step
                self.create_new_trial()
                dt_seconds = None
            else:
                # compute the score based on the configured reward function if the trial exists ...
                score = self.reward_function(mean_room_temperature, setpoint_temperature)
                # ... and update the trial with the score and the passed seconds
                self.update_current_trial(
                    score=score,
                    dt_seconds=dt_seconds)
            if self.is_optimization_finished():
                # check if the optimization is finished and if yes terminate the optimization
                self.stop_optimization()
            else:
                if self.get_current_trial() is None:
                    # create a new trial and set the passed seconds to None to make a small step
                    self.create_new_trial()
                    dt_seconds = None
        if self.is_optimization_running():
            # if the optimization is running the parameters come from the current trial ...
            parameter_values = self.get_current_trial().parameters
        else:
            # ... otherwise the best available parameters are used
            parameter_values = self.get_best_available_params()

        # save the currently applied setpoint temperature in the internal state
        self._current_setpoint_temperature = setpoint_temperature

        # get the model output from the underlying model
        return self.get_model_output(mean_room_temperature, setpoint_temperature, parameter_values, dt_seconds)

    def create_study_name(self) -> str:
        """
        creates a suitable study name for the study

        :returns: the study name
        """

        study_name = f'{datetime.now().strftime("%m/%d %H:%M:%S")} {self.study_title}'
        for x in self.parameter_configs:
            study_name += f" {x.name}:{x.limits}/{x.step}"

        return study_name

    def start_optimization(self,
                           reward_config: tuple[Callable[[float, float], float], StudyDirection],
                           optimization_trials: int,
                           optimization_trial_seconds: int,
                           study_title: str = '',
                           storage: str | None = 'sqlite:///db.sqlite3') -> None:
        """
        starts an optimization run

        :param reward_config: the reward function config
        :param optimization_trials: amount of trials to test
        :param optimization_trial_seconds: trial duration in seconds
        :param optimization_trial_seconds: trial duration in seconds
        :param study_title: the title used in the optuna study
        :param storage: where and if the study should be stored on the disk
        """

        if self.is_optimization_running():
            return

        # set all optimization parameters that are not initially set
        self.reward_function, self.study_direction = reward_config
        self.optimization_trials = optimization_trials
        self.optimization_trial_seconds = optimization_trial_seconds
        self.study_title = study_title

        # create the study
        self.study = create_study(
            study_name=self.create_study_name(),
            direction=self.study_direction,
            storage=storage)
        # enqueue the initial parameters
        self.study.enqueue_trial({x.name: x.value for x in self.get_initial_parameter_values()})
        # add a new stats object
        self.optimization_run_stat_dict[self.get_current_study_name()] = OptimizationRunStat(
            trials={})

    def get_current_setpoint_temperature(self):
        """
        get the current setpoint temperature 

        :returns the temperature of the current setpoint
        """

        return self._current_setpoint_temperature

    def get_best_available_params(self) -> tuple[ParameterValue, ...]:
        """
        get the best parameters of the current study

        :returns the best parameters of the current study
        """

        trials = ()
        for trial_list in map(lambda x: x.trials.values(), self.optimization_run_stat_dict.values()):
            trials = trials + tuple(trial_list)
        return self.get_best_parameters_of_trials(trials)

    def get_best_parameters_of_trials(self, trials: tuple[OptimizationRunTrial, ...]) -> tuple[ParameterValue, ...]:
        """
        finds the best parameters

        :param trials: all the made trials

        :returns: the best available parameters from the trials or the initial parameter set
        """

        sorted_trials = sorted(trials, key=lambda x: x.score)
        if len(sorted_trials) == 0:
            return self.get_initial_parameter_values()
        if self.study_direction == StudyDirection.MAXIMIZE:
            return sorted_trials[-1].parameters
        elif self.study_direction == StudyDirection.MINIMIZE:
            return sorted_trials[0].parameters
        else:
            raise RuntimeError

    def stop_optimization(self) -> None:
        """
        stops the currently running optimization
        """

        if not self.is_optimization_running():
            return
        del self.study
        self.study = None

    def get_parameters_from_trial(self, trial: Trial) -> tuple[ParameterValue, ...]:
        """
        get new parameters from the passed optuna trial

        :param trial the optuna trial

        :returns new parameters from the trial
        """
        return tuple(
            [ParameterValue(name=x.name, value=trial.suggest_float(x.name, *x.limits, step=x.step))
             for x in self.parameter_configs])

    def get_completed_optimization_run_stats(self) -> dict[str, OptimizationRunStat]:
        """
        get the completed optimization runs, the run stats that have only completed trials

        :returns the completed stats
        """

        return {study_name: optimization_run_stat
                for study_name, optimization_run_stat in self.optimization_run_stat_dict.items()
                if len(get_finished_trials(tuple(optimization_run_stat.trials.values()))) ==
                len(tuple(optimization_run_stat.trials.values()))}

    def get_completed_optimization_run_count(self) -> int:
        """
        get the completed optimization run count

        :returns the completed run count
        """

        return len(self.get_completed_optimization_run_stats())

    def is_optimized_at_least_once(self) -> bool:
        """
        returns if the optimization completed successfully at least once

        :returns if the optimization was successful once
        """

        return self.get_completed_optimization_run_count() > 0

    @abc.abstractmethod
    def get_model_output(self,
                         mean_room_temperature: float,
                         setpoint_temperature: float,
                         parameter_values: tuple[ParameterValue, ...],
                         dt_seconds: float | None,
                         ) -> float:
        """
        this function asks the underlying model for the new boiler temperature
        and gives the current setpoint temperature and parameter values to it

        :param mean_room_temperature: the current mean room temperature
        :param setpoint_temperature: the currently desired mean room temperature
        :param parameter_values: the parameters that should currently be applied to the underlying model
        :param dt_seconds: the seconds since the controller was last queried or None if it is the first invocation

        :returns the boiler temperature within the specified output limits
        """

        raise NotImplementedError

    @abc.abstractmethod
    def reset_model(self) -> None:
        """
        resets the model internals, this is useful if the model is used in a simulation
        and each model should start from the same starting state
        """

        raise NotImplementedError
