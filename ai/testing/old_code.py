import argparse
import csv
import os
import threading
from datetime import datetime, timedelta
from random import random
from typing import Any
from typing import Optional, List, Union, Dict
from typing import Tuple

import holidays
import matplotlib.pyplot as plt
import numpy as np
import optuna
import pandas as pd
import torch as th
import torch.nn as nn
from matplotlib.backends.backend_pdf import PdfPages
from sinergym.utils.logger import CSVLogger
from sinergym.utils.wrappers import LoggerWrapper, NormalizeObservation
from stable_baselines3.common.callbacks import BaseCallback
from stable_baselines3.common.env_util import is_wrapped
from stable_baselines3.common.policies import ActorCriticPolicy
from stable_baselines3.common.type_aliases import Schedule

from reward import get_value_from_obs_dict
from time_utils import get_summer_time_range


def _clamp(value, limits):
    lower, upper = limits
    if value is None:
        return None
    elif (upper is not None) and (value > upper):
        return upper
    elif (lower is not None) and (value < lower):
        return lower
    return value


class PID(object):
    """A simple PID controller."""

    def __init__(
            self,
            Kp=1.0,
            Ki=0.0,
            Kd=0.0,
            setpoint=0,
            sample_time=0.01,
            output_limits=(None, None),
            auto_mode=True,
            proportional_on_measurement=False,
            differential_on_measurement=True,
            error_map=None,
            time_fn=None,
            starting_output=0.0,
            ff_set=True
    ):
        """
        Initialize a new PID controller.

        :param Kp: The value for the proportional gain Kp
        :param Ki: The value for the integral gain Ki
        :param Kd: The value for the derivative gain Kd
        :param setpoint: The initial setpoint that the PID will try to achieve
        :param sample_time: The time in seconds which the controller should wait before generating
            a new output value. The PID works best when it is constantly called (eg. during a
            loop), but with a sample time set so that the time difference between each update is
            (close to) constant. If set to None, the PID will compute a new output value every time
            it is called.
        :param output_limits: The initial output limits to use, given as an iterable with 2
            elements, for example: (lower, upper). The output will never go below the lower limit
            or above the upper limit. Either of the limits can also be set to None to have no limit
            in that direction. Setting output limits also avoids integral windup, since the
            integral term will never be allowed to grow outside of the limits.
        :param auto_mode: Whether the controller should be enabled (auto mode) or not (manual mode)
        :param proportional_on_measurement: Whether the proportional term should be calculated on
            the input directly rather than on the error (which is the traditional way). Using
            proportional-on-measurement avoids overshoot for some types of systems.
        :param differential_on_measurement: Whether the differential term should be calculated on
            the input directly rather than on the error (which is the traditional way).
        :param error_map: Function to transform the error value in another constrained value.
        :param time_fn: The function to use for getting the current time, or None to use the
            default. This should be a function taking no arguments and returning a number
            representing the current time. The default is to use time.monotonic() if available,
            otherwise time.time().
        :param starting_output: The starting point for the PID's output. If you start controlling
            a system that is already at the setpoint, you can set this to your best guess at what
            output the PID should give when first calling it to avoid the PID outputting zero and
            moving the system away from the setpoint.
        """
        self.Kp, self.Ki, self.Kd = Kp, Ki, Kd
        self.setpoint = setpoint
        self.sample_time = sample_time

        self._min_output, self._max_output = None, None
        self._auto_mode = auto_mode
        self.proportional_on_measurement = proportional_on_measurement
        self.differential_on_measurement = differential_on_measurement
        self.error_map = error_map
        self.ff_set = ff_set

        self._proportional = 0
        self._integral = 0
        self._derivative = 0

        self._last_time = None
        self._last_output = None
        self._last_error = None
        self._last_input = None

        if self.ff_set:
            self.ff_gain = (self.Kd / self.Kp)

        if time_fn is not None:
            # Use the user supplied time function
            self.time_fn = time_fn
        else:
            import time

            try:
                # Get monotonic time to ensure that time deltas are always positive
                self.time_fn = time.monotonic
            except AttributeError:
                # time.monotonic() not available (using python < 3.3), fallback to time.time()
                self.time_fn = time.time

        self.output_limits = output_limits
        self.reset()

        # Set initial state of the controller
        self._integral = _clamp(starting_output, output_limits)

    def __call__(self, input_, dist, dt=None):
        """
        Update the PID controller.

        Call the PID controller with *input_* and calculate and return a control output if
        sample_time seconds has passed since the last update. If no new output is calculated,
        return the previous output instead (or None if no value has been calculated yet).

        :param dt: If set, uses this value for timestep instead of real time. This can be used in
            simulations when simulation time is different from real time.
        """
        if not self.auto_mode:
            return self._last_output

        now = self.time_fn()
        if dt is None:
            dt = now - self._last_time if (now - self._last_time) else 1e-16
        elif dt <= 0:
            raise ValueError('dt has negative value {}, must be positive'.format(dt))

        if self.sample_time is not None and dt < self.sample_time and self._last_output is not None:
            # Only update every sample_time seconds
            return self._last_output

        # Compute error terms
        error = self.setpoint - input_
        d_input = input_ - (self._last_input if (self._last_input is not None) else input_)
        d_error = error - (self._last_error if (self._last_error is not None) else error)

        # Check if must map the error
        if self.error_map is not None:
            error = self.error_map(error)

        # Compute the proportional term
        if not self.proportional_on_measurement:
            # Regular proportional-on-error, simply set the proportional term
            self._proportional = self.Kp * error
        else:
            # Add the proportional error on measurement to error_sum
            self._proportional -= self.Kp * d_input

        # Compute Feedforward like in written in https://apmonitor.com/pdc/index.php/Main/FeedforwardControl
        if self.ff_set:
            disturbance = self.ff_gain * dist

            # Compute integral and derivative terms
            self._integral += self.Ki * error * dt * disturbance
        else:
            self._integral += self.Ki * error * dt
        self._integral = _clamp(self._integral, self.output_limits)  # Avoid integral windup

        if self.differential_on_measurement:
            self._derivative = -self.Kd * d_input / dt
        else:
            self._derivative = self.Kd * d_error / dt

        # Compute final output
        output = self._proportional + self._integral + self._derivative
        output = _clamp(output, self.output_limits)

        # Keep track of state
        self._last_output = output
        self._last_input = input_
        self._last_error = error
        self._last_time = now

        return output

    def __repr__(self):
        return (
            '{self.__class__.__name__}('
            'Kp={self.Kp!r}, Ki={self.Ki!r}, Kd={self.Kd!r}, '
            'setpoint={self.setpoint!r}, sample_time={self.sample_time!r}, '
            'output_limits={self.output_limits!r}, auto_mode={self.auto_mode!r}, '
            'proportional_on_measurement={self.proportional_on_measurement!r}, '
            'differential_on_measurement={self.differential_on_measurement!r}, '
            'error_map={self.error_map!r}'
            ')'
        ).format(self=self)

    @property
    def components(self):
        """
        The P-, I- and D-terms from the last computation as separate components as a tuple. Useful
        for visualizing what the controller is doing or when tuning hard-to-tune systems.
        """
        return self._proportional, self._integral, self._derivative

    @property
    def tunings(self):
        """The tunings used by the controller as a tuple: (Kp, Ki, Kd)."""
        return self.Kp, self.Ki, self.Kd

    @tunings.setter
    def tunings(self, tunings):
        """Set the PID tunings."""
        self.Kp, self.Ki, self.Kd = tunings

    @property
    def auto_mode(self):
        """Whether the controller is currently enabled (in auto mode) or not."""
        return self._auto_mode

    @auto_mode.setter
    def auto_mode(self, enabled):
        """Enable or disable the PID controller."""
        self.set_auto_mode(enabled)

    def set_auto_mode(self, enabled, last_output=None):
        """
        Enable or disable the PID controller, optionally setting the last output value.

        This is useful if some system has been manually controlled and if the PID should take over.
        In that case, disable the PID by setting auto mode to False and later when the PID should
        be turned back on, pass the last output variable (the control variable) and it will be set
        as the starting I-term when the PID is set to auto mode.

        :param enabled: Whether auto mode should be enabled, True or False
        :param last_output: The last output, or the control variable, that the PID should start
            from when going from manual mode to auto mode. Has no effect if the PID is already in
            auto mode.
        """
        if enabled and not self._auto_mode:
            # Switching from manual mode to auto, reset
            self.reset()

            self._integral = last_output if (last_output is not None) else 0
            self._integral = _clamp(self._integral, self.output_limits)

        self._auto_mode = enabled

    @property
    def output_limits(self):
        """
        The current output limits as a 2-tuple: (lower, upper).

        See also the *output_limits* parameter in :meth:`PID.__init__`.
        """
        return self._min_output, self._max_output

    @output_limits.setter
    def output_limits(self, limits):
        """Set the output limits."""
        if limits is None:
            self._min_output, self._max_output = None, None
            return

        min_output, max_output = limits

        if (None not in limits) and (max_output < min_output):
            raise ValueError('lower limit must be less than upper limit')

        self._min_output = min_output
        self._max_output = max_output

        self._integral = _clamp(self._integral, self.output_limits)
        self._last_output = _clamp(self._last_output, self.output_limits)

    def reset(self):
        """
        Reset the PID controller internals.

        This sets each term to 0 as well as clearing the integral, the last output and the last
        input (derivative calculation).
        """
        self._proportional = 0
        self._integral = 0
        self._derivative = 0

        self._integral = _clamp(self._integral, self.output_limits)

        self._last_time = self.time_fn()
        self._last_output = None
        self._last_input = None


EPW_COLUMN_NAMES = [
    'Year', 'Month', 'Day', 'Hour', 'Minute', 'Data Source and Uncertainty Flags',
    'Dry Bulb Temperature (°C)', 'Dew Point Temperature (°C)', 'Relative Humidity (%)',
    'Atmospheric Station Pressure (Pa)', 'Extraterrestrial Horizontal Radiation (Wh/m^2)',
    'Extraterrestrial Direct Normal Radiation (Wh/m^2)', 'Horizontal Infrared Radiation Intensity (Wh/m^2)',
    'Global Horizontal Radiation (Wh/m^2)', 'Direct Normal Radiation (Wh/m^2)',
    'Diffuse Horizontal Radiation (Wh/m^2)', 'Global Horizontal Illuminance (lux)',
    'Direct Normal Illuminance (lux)', 'Diffuse Horizontal Illuminance (lux)',
    'Zenith Luminance (Cd/m^2)', 'Wind Direction (°)', 'Wind Speed (m/s)',
    'Total Sky Cover (%)', 'Opaque Sky Cover (%)', 'Visibility (km)',
    'Ceiling Height (m)', 'Present Weather Observation', 'Present Weather Codes',
    'Precipitable Water (mm)', 'Aerosol Optical Depth (thousandths)', 'Snow Depth (cm)',
    'Days Since Last Snowfall', 'Albedo', 'Liquid Precipitation Depth (mm)',
    'Liquid Precipitation Quantity (hr)'
]


def get_thermostat_setpoint_temperature(abbreviation: str) -> str:
    mapping = {
        'factory': [
            '(SPACE1-1)',
        ]
    }
    return mapping[abbreviation]


def get_time(info) -> tuple[datetime, Any, Any, Any, Any]:
    year = info['year'] if "year" in info else info['init_year']
    month = info['month'] if "month" in info else info['init_month']
    day = info['day'] if "day" in info else info['init_day']
    hour = info['hour'] if "hour" in info else info['init_hour']
    current_time = datetime(year, month, day, hour)
    return current_time, year, month, day, hour


def get_future_values(df, info, future_string, future_period) -> pd.DataFrame:
    start_time, year, month, day, hour = get_time(info)

    if hour + future_period >= 24:
        day += 1
        try:
            datetime(year, month, day)
        except ValueError:
            day = 1
            if month == 12:
                month = 1
                year += 1
            else:
                month += 1

        remain_hours = future_period - (23 - hour)
        end_time = datetime(year, month, day, remain_hours)
    else:

        end_time = datetime(year, month, day, hour + future_period)

    return df.loc[start_time:end_time][future_string].mean()


def get_seasonal_type(summer_winter) -> str:
    if summer_winter[0] and not summer_winter[1]:
        seasonal_type = 'winter'
    elif summer_winter[1] and not summer_winter[0]:
        seasonal_type = 'summer'
    else:
        seasonal_type = 'hybrid'
    return seasonal_type


def check_summer_or_winter_by_time(info) -> str:
    current_dt, year, _, _, _ = get_time(info)
    timerange = get_summer_time_range()
    summer_start_date = datetime(*timerange[2::-1])
    summer_final_date = datetime(*timerange[5:2:-1])

    if summer_start_date <= current_dt <= summer_final_date:
        return 'summer'
    else:
        return 'winter'


def get_default_energy_variable_name() -> str:
    return 'Facility Total HVAC Electricity Demand Rate(Whole Building)'


def get_default_setpoint(abbreviation: str) -> list[str]:
    return ['Zone Thermostat Heating Setpoint Temperature' + get_thermostat_setpoint_temperature(abbreviation)[0],
            'Zone Thermostat Cooling Setpoint Temperature' + get_thermostat_setpoint_temperature(abbreviation)[0]]


class CustomCSVLogger(CSVLogger):

    def __init__(
            self,
            monitor_header: str,
            progress_header: str,
            log_progress_file: str,
            log_file: Optional[str] = None,
            flag: bool = True):
        super(CustomCSVLogger, self).__init__(monitor_header, progress_header, log_progress_file, log_file, flag)
        self.episode_data = {
            'rewards': [],
            'temperature': [],
            'temperature_reward': [],
            'reward_energy': [],
            'powers': [],
            'normalized_energy_value': [],
            'abs_comfort': [],
            'power_penalties': [],
            'total_timesteps': 0,
            'total_time_elapsed': 0,
            'comfort_violation_timesteps': 0
        }

    def _create_row_content(
            self,
            obs: List[Any],
            action: Union[int, np.ndarray, List[Any]],
            terminated: bool,
            info: Optional[Dict[str, Any]]) -> List:

        return [
            info.get('timestep', 0)] + list(obs) + list(action) + [
            info.get('time_elapsed', 0),
            info.get('reward', None),
            info.get('comfort_penalties'),
            info.get('temperature'),
            info.get('temperature_reward'),
            info.get('reward_energy'),
            info.get('facility_total_electricity'),
            info.get('normalized_energy_value'),
            info.get('comfort_penalties'),
            info.get('abs_comfort'),
            terminated]

    def _store_step_information(
            self,
            info: Dict[str, Any]) -> None:
        """Store relevant data to episode summary in progress.csv.

        Args:
            info (Optional[Dict[str, Any]]): Extra info collected in step.

        """
        # In reset, info this keys are not available
        if info.get('reward'):
            self.episode_data['rewards'].append(info.get('reward'))
        if info.get('temperature'):
            self.episode_data['temperature'].append(info.get('temperature'))
        if info.get('temperature_reward'):
            self.episode_data['temperature_reward'].append(info.get('temperature_reward'))
        if info.get('total_energy'):
            self.episode_data['powers'].append(info.get('total_energy'))
        if info.get('normalized_energy_value'):
            self.episode_data['normalized_energy_value'].append(info.get('normalized_energy_value'))
        if info.get('reward_energy') is not None:
            self.episode_data['power_penalties'].append(
                info.get('reward_energy'))
        if info.get('reward_energy') != 0:
            self.episode_data['comfort_violation_timesteps'] += 1
        self.episode_data['total_timesteps'] = info.get('timestep')
        self.episode_data['total_time_elapsed'] = info.get('time_elapsed')

    def log_step(
            self,
            obs: List[Any],
            action: Union[int, np.ndarray, List[Any]],
            terminated: bool,
            info: Dict[str, Any]) -> None:
        """Log step information and store it in steps_data attribute.

        Args:
            obs (List[Any]): Observation from step.
            action (Union[int, np.ndarray, List[Any]]): Action done in step.
            terminated (bool): terminated flag in step.
            info (Dict[str, Any]): Extra info collected in step.
        """
        if self.flag:
            self.steps_data.append(
                self._create_row_content(
                    obs, action, terminated, info))
            # Store step information for episode
            self._store_step_information(info)

    def log_step_normalize(
            self,
            obs: List[Any],
            action: Union[int, np.ndarray, List[Any]],
            terminated: bool,
            info: Dict[str, Any]) -> None:
        """Log step information and store it in steps_data attribute.

        Args:
            obs (List[Any]): Observation from step.
            action (Union[int, np.ndarray, List[Any]]): Action done in step.
            terminated (bool): terminated flag in step.
            info (Optional[Dict[str, Any]]): Extra info collected in step.
        """
        if self.flag:
            self.steps_data_normalized.append(
                self._create_row_content(
                    obs, action, terminated, info))

    def log_episode(self, episode: int) -> None:
        """Log episode main information using steps_data param.

        Args:
            episode (int): Current simulation episode number.

        """
        if self.flag:
            # statistics metrics for whole episode
            ep_mean_reward = np.mean(self.episode_data['rewards'])
            ep_cumulative_reward = np.sum(self.episode_data['rewards'])
            ep_cumulative_power = np.sum(self.episode_data['powers'])
            ep_mean_power = np.mean(self.episode_data['powers'])
            ep_cumulative_power_penalty = np.sum(
                self.episode_data['power_penalties'])
            ep_mean_power_penalty = np.mean(
                self.episode_data['power_penalties'])
            try:
                comfort_violation = (
                        self.episode_data['comfort_violation_timesteps'] /
                        self.episode_data['total_timesteps'] *
                        100)
            except ZeroDivisionError:
                comfort_violation = np.nan

            # write steps_info in monitor.csv
            with open(self.log_file, 'w', newline='') as file_obj:
                # Create a writer object from csv module
                csv_writer = csv.writer(file_obj)
                # Add contents of list as last row in the csv file
                csv_writer.writerows(self.steps_data)

            # Write normalize steps_info in monitor_normalized.csv
            if len(self.steps_data_normalized) > 1:
                with open(self.log_file[:-4] + '_normalized.csv', 'w', newline='') as file_obj:
                    # Create a writer object from csv module
                    csv_writer = csv.writer(file_obj)
                    # Add contents of list as last row in the csv file
                    csv_writer.writerows(self.steps_data_normalized)

            # Create CSV file with header if it's required for progress.csv
            if not os.path.isfile(self.log_progress_file):
                with open(self.log_progress_file, 'a', newline='\n') as file_obj:
                    file_obj.write(self.progress_header)

            # building episode row
            row_contents = [
                episode,
                ep_cumulative_reward,
                ep_mean_reward,
                ep_cumulative_power,
                ep_mean_power,
                ep_cumulative_power_penalty,
                ep_mean_power_penalty,
                comfort_violation,
                self.episode_data['total_timesteps'],
                self.episode_data['total_time_elapsed']]

            with open(self.log_progress_file, 'a+', newline='') as file_obj:
                # Create a writer object from csv module
                csv_writer = csv.writer(file_obj)
                # Add contents of list as last row in the csv file
                csv_writer.writerow(row_contents)

            # Reset episode information
            self._reset_logger()

    def _reset_logger(self) -> None:
        self.steps_data = [self.monitor_header.split(',')]
        self.steps_data_normalized = [self.monitor_header.split(',')]
        self.episode_data = {
            'rewards': [],
            'temperature': [],
            'temperature_reward': [],
            'reward_energy': [],
            'powers': [],
            'normalized_energy_value': [],
            'abs_comfort': [],
            'power_penalties': [],
            'total_timesteps': 0,
            'total_time_elapsed': 0,
            'comfort_violation_timesteps': 0
        }


class CustomLoggerCallback(BaseCallback):
    """Custom callback for plotting additional values in tensorboard"""

    def __init__(self, sinergym_logger=False, verbose=0):
        """Custom callback for plotting additional values in tensorboard.
        Args:
            sinergym_logger (boolean): Indicate if CSVLogger inner Sinergym will be activated or not.
        """
        super(CustomLoggerCallback, self).__init__(verbose)

        self.sinergym_logger = sinergym_logger

        self.ep_rewards = []
        self.ep_powers = []
        self.ep_term_energy = []
        self.ep_temp = []
        self.ep_timesteps = 0

        self.heating_action = pd.DataFrame(columns=['date', 'heating', 'average', 'outsideTemp'])
        self.cooling_action = pd.DataFrame(columns=['date', 'cooling', 'average', 'outsideTemp'])

        self.infos = pd.DataFrame()
        self.detailed_infos = pd.DataFrame()
        self.data_detailed = []
        self.episode = 0

        self.train_values = pd.DataFrame(columns=['loss', 'entropy_loss', 'policy_gradient_loss', 'explained_variance',
                                                  'learning_rate', 'value_loss'])

    def _on_training_start(self):
        # sinergym logger
        if is_wrapped(self.training_env, LoggerWrapper):
            if self.sinergym_logger:
                self.training_env.env_method('activate_logger')
            else:
                self.training_env.env_method('deactivate_logger')

        # record method depending on the type of algorithm
        if 'OnPolicyAlgorithm' in self.globals.keys():
            self.record = self.logger.record
        elif 'OffPolicyAlgorithm' in self.globals.keys():
            self.record = self.logger.record_mean
        else:
            raise KeyError

    def _on_step(self) -> bool:
        info = self.locals['infos'][-1]

        if all(self.training_env.get_attr('winter_summer')[0]):
            weather_type = "Hybrid"
        elif self.training_env.get_attr('winter_summer')[0][0]:
            weather_type = "Heating"
        else:
            weather_type = "Cooling"

        average_temperature = 0
        outside_temp = 0
        # OBSERVATION
        variables = self.training_env.get_attr('variables')[0]['observation']

        self.record(
            '***INFO***/Thread_number', threading.current_thread().name)
        self.record(
            '***INFO***/Type', weather_type)

        # log normalized and original values
        if self.training_env.env_is_wrapped(
                wrapper_class=NormalizeObservation)[0]:
            obs_normalized = self.locals['new_obs'][-1]
            obs = self.training_env.env_method('get_unwrapped_obs')[-1]
            for i, variable in enumerate(variables):
                self.record(
                    'normalized_observation/' + variable, obs_normalized[i])
                self.record(
                    'observation/' + variable, obs[i])
        # Only original values
        else:
            for (key, value) in self.training_env.get_attr("obs_dict")[0].items():
                self.record('observation/' + key, value)
                if 'Zone Air Temperature' in key:
                    average_temperature += value
                elif 'Site Outdoor Air Drybulb Temperature' in key:
                    outside_temp = value

        average_temperature = np.mean(average_temperature)
        # ACTION
        variables = self.training_env.get_attr('variables')[0]['action']

        action = None
        # sinergym action received inner its own setpoints range
        action_ = info['action']
        try:
            # network output clipped with gym action space
            if all(self.training_env.get_attr('winter_summer')[0]):
                action = self.locals['clipped_actions'][-1]
            elif self.training_env.get_attr('winter_summer')[0][0]:
                action = np.append(self.locals['clipped_actions'][-1], 0)
            else:
                action = np.append(0, self.locals['clipped_actions'][-1])

            if info['month'] == 11:
                new_row = {'date': pd.to_datetime(datetime(info['year'], info['month'], info['day'], info['hour'])),
                           'heating': action[0] * 100, 'average': average_temperature, 'outsideTemp': outside_temp}

                self.heating_action.loc[len(self.heating_action)] = new_row
            if info['month'] == 7:
                new_row = {'date': pd.to_datetime(datetime(info['year'], info['month'], info['day'], info['hour'])),
                           'cooling': action[1] * 100, 'average': average_temperature, 'outsideTemp': outside_temp}

                self.cooling_action.loc[len(self.cooling_action)] = new_row

        except KeyError:
            try:
                action = self.locals['action'][-1]
            except KeyError:
                try:
                    action = self.locals['actions'][-1]
                except KeyError:
                    raise KeyError(
                        'Algorithm action key in locals dict unknown.')

        if self.training_env.get_attr('flag_discrete')[0]:
            action = self.training_env.get_attr('action_mapping')[0][action]
        for i, variable in enumerate(variables):
            if action is not None:
                self.record(
                    'action/' + variable, action[i])

            self.record(
                'action_simulation/' + variable, action_[i])

        # Store episode data
        try:
            self.ep_rewards.append(self.locals['rewards'][-1])
        except KeyError:
            try:
                self.ep_rewards.append(self.locals['reward'][-1])
            except KeyError:
                print('Algorithm reward key in locals dict unknown')

        self.ep_term_energy.append(info['reward_energy'])
        self.ep_temp.append(info['reward_comfort'])
        detailed_info_row = {'timestep': self.ep_timesteps, 'full_reward': np.sum(self.ep_rewards),
                             'energy_reward': np.sum(self.ep_term_energy),
                             'temp_reward': np.sum(self.ep_temp)}

        self.detailed_infos = pd.concat([self.detailed_infos, pd.DataFrame([detailed_info_row])])

        self.ep_timesteps += 1

        # If episode ends, store summary of episode and reset
        try:
            done = self.locals['dones'][-1]
        except KeyError:
            try:
                done = self.locals['done'][-1]
            except KeyError:
                print('Algorithm done key in locals dict unknown')

        if done:
            # store last episode metrics
            self.episode_metrics = {}
            self.episode_metrics['ep_length'] = self.ep_timesteps
            self.episode_metrics['cumulative_reward'] = np.sum(
                self.ep_rewards)
            self.episode_metrics['mean_reward'] = np.mean(self.ep_rewards)
            self.episode_metrics['cumulative_power'] = np.sum(self.ep_powers)
            self.episode_metrics['mean_power_penalty'] = np.mean(
                self.ep_term_energy)
            self.episode_metrics['cumulative_power_penalty'] = np.sum(
                self.ep_term_energy)
            self.episode_metrics['cumulative_temp_penalty'] = np.sum(self.ep_temp)
            self.episode_metrics['mean_temp_penalty'] = np.mean(
                self.ep_temp)
            self.episode_metrics['index'] = self.episode
            self.episode += 1
            self.infos = pd.concat([self.infos, pd.DataFrame([self.episode_metrics])])
            self.data_detailed.append(self.detailed_infos.copy())
            # reset episode info
            self.ep_rewards = []
            self.ep_powers = []
            self.ep_temp = []
            self.ep_term_energy = []
            self.ep_timesteps = 0
            self.num_comfort_violation = 0
            self.detailed_infos = pd.DataFrame()

        # During first episode, as it not finished, it shouldn't be recording
        if hasattr(self, 'episode_metrics'):
            for key, metric in self.episode_metrics.items():
                self.logger.record(
                    'episode/' + key, metric)
        new_row = {}
        for key, value in self.logger.name_to_value.items():
            if key.startswith('train') and ('loss' in key or 'explained' in key or 'rate' in key):
                new_row[key.split('/')[1]] = value
        if len(new_row) > 0:
            is_duplicate = self.train_values[self.train_values.duplicated(new_row, keep=False)].shape[0] > 0
            if not is_duplicate:
                self.train_values.loc[len(self.train_values)] = new_row
        return True

    def on_training_end(self):
        self.plotting()
        if is_wrapped(self.training_env, LoggerWrapper):
            self.training_env.env_method('activate_logger')

    def plotting(self):
        self.infos.plot(x='index', y='cumulative_reward', title=f"Cumulative Reward-{self.model.ent_coef}")
        self.infos.plot(x='index', y='mean_reward', title=f"Mean Reward-{self.model.ent_coef}")
        self.train_values.plot(y='loss', title=f"Full loss-{self.model.ent_coef}")
        self.train_values.plot(y='entropy_loss', title=f"Entropy loss-{self.model.ent_coef}")
        self.train_values.plot(y='policy_gradient_loss', title=f"Policy loss-{self.model.ent_coef}")
        self.train_values.plot(y='explained_variance', title=f"Explained Variance-{self.model.ent_coef}")
        self.train_values.plot(y='learning_rate', title=f"Learning Rate-{self.model.ent_coef}")
        self.train_values.plot(y='value_loss', title=f"Value loss-{self.model.ent_coef}")
        plt.show()


class CustomLSTMPolicy(ActorCriticPolicy):
    def __init__(self, observation_space, action_space, lr_schedule=None,
                 net_arch=None, activation_fn=nn.Tanh, **kwargs):
        kwargs["ortho_init"] = False
        super(CustomLSTMPolicy, self).__init__(observation_space, action_space,
                                               lr_schedule, net_arch,
                                               activation_fn, **kwargs)

    def _build(self, lr_schedule: Schedule) -> None:
        self._build_mlp_extractor()

        latent_dim_pi = self.mlp_extractor.latent_dim_pi

        self.action_net, self.log_std = self.action_dist.proba_distribution_net(
            latent_dim=latent_dim_pi, log_std_init=self.log_std_init
        )

        self.value_net = nn.Linear(self.mlp_extractor.latent_dim_vf, 1)

        self.lstm = nn.LSTM(self.net_arch['pi'][1], 64)

        self.optimizer = self.optimizer_class(self.parameters(), lr=lr_schedule(1), **self.optimizer_kwargs)

    def forward(self, obs: th.Tensor, deterministic: bool = False) -> Tuple[th.Tensor, th.Tensor, th.Tensor]:
        features = self.extract_features(obs)
        latent_pi, latent_vf = self.mlp_extractor(features)
        value = self.value_net(latent_vf)

        # lstm_out, _ = self.lstm(latent_pi.unsqueeze(0))
        # lstm_out = lstm_out.squeeze(1)

        distribution = self._get_action_dist_from_latent(latent_pi)

        action = distribution.get_actions(deterministic=deterministic)
        log_prob = distribution.log_prob(action)

        action = action.reshape((-1, *self.action_space.shape))
        return action, value, log_prob


'''
For the future weather values -> epw file gets loaded and resampled. Send back to the other function with the runperiod
'''


def read_epw_file(epw_file_path, runperiod, noise_level=1.0) -> pd.DataFrame:
    start_date = datetime(*runperiod[2::-1])
    end_date = datetime(*runperiod[:2:-1], 23, 59, 59)

    df = pd.read_csv('./weather_data/' + epw_file_path, skiprows=8, header=None, names=EPW_COLUMN_NAMES)
    df['DateTime'] = pd.to_datetime(df[['Year', 'Month', 'Day', 'Hour', 'Minute']])
    df.set_index('DateTime', inplace=True)
    df.drop(columns=['Year', 'Month', 'Day', 'Hour', 'Minute'], inplace=True)

    df.iloc[:, 1] += noise_level * random.uniform(-1, 1)
    df.iloc[:, 12] += noise_level * random.uniform(-1, 1)
    df.iloc[:, 13] += noise_level * random.uniform(-1, 1)

    df = df.resample('15T').interpolate(method='linear')

    return df.loc[start_date:end_date]


'''
Error calculation maybe for later, when energy consumption is considered.
'''


def error_calc(error, env) -> float:
    rewards = env.reward_fn
    energy = get_value_from_obs_dict(env.obs_dict, rewards.energy_variable) / rewards.maximum_electricity_demand
    weight_temp = 1.2
    weight_energy = 0.5

    energy_reward = energy * rewards.energy_factor

    combined_error = (weight_temp * error + weight_energy * energy_reward)

    return combined_error


'''
Disturbance Caluclation, where future target temp, future outside temp and solar is considered
'''


def calculate_disturbance(df, info, env, v1, v2) -> float:
    future_mean_outside_temp = get_future_values(df, info, 'Dry Bulb Temperature (°C)', 6)
    future_diff_light = get_future_values(df, info, 'Diffuse Horizontal Illuminance (lux)', 6)
    future_direct_light = get_future_values(df, info, 'Direct Normal Illuminance (lux)', 6)

    room_temp = env.obs_dict['Zone Air Temperature(SPACE1-1)']
    dist_temp = future_mean_outside_temp - room_temp

    # convert from lux to W/m2
    future_direct_light *= 0.0079
    future_diff_light *= 0.0079

    return v1 * dist_temp + v2 * (future_diff_light + future_direct_light)


'''
This method has two different tasks. First when the target temperature is changing it changes for all important variables.
Secondly it is used to get the future target temperature
'''


# todo_change name
def get_future_target_temp(info, args) -> float:
    current_time, _, _, _, hour = get_time(info)
    season = check_summer_or_winter_by_time(info)
    at_holidays = holidays.Austria()

    if current_time.weekday() >= 5 or (int(hour) >= 18 or int(hour) <= 6) or current_time in at_holidays:
        if season == 'winter':
            target_temp = args.off_days_winter_temp
        else:
            target_temp = args.off_days_summer_temp
    else:
        target_temp = args.target_temp
    return target_temp


def set_setpoints(info, env, args, pid_cooling, pid_heating) -> None:
    current_time, _, _, _, hour = get_time(info)
    season = check_summer_or_winter_by_time(info)
    at_holidays = holidays.Austria()

    if current_time.weekday() >= 5 or (int(hour) >= 18 or int(hour) <= 6) or current_time in at_holidays:
        if season == 'winter':
            pid_heating.setpoint = args.off_days_winter_temp
            pid_cooling.setpoint = args.off_days_winter_temp
            env.target_temperature = args.off_days_winter_temp
            env.unwrapped.reward_fn.target_temperature = args.off_days_winter_temp
        else:
            pid_heating.setpoint = args.off_days_summer_temp
            pid_cooling.setpoint = args.off_days_summer_temp
            env.target_temperature = args.off_days_summer_temp
            env.unwrapped.reward_fn.target_temperature = args.off_days_summer_temp

    else:
        pid_heating.setpoint = args.target_temp
        pid_cooling.setpoint = args.target_temp
        env.target_temperature = args.target_temp
        env.unwrapped.reward_fn.target_temperature = args.target_temp


'''
Future target temperature gets saved into a list or it fills the list with the net one. 
'''


def future_temp(env, info, args, looping=True) -> list[float] | float:
    start_time, _, _, _, _ = get_time(info)
    end_time = start_time + timedelta(hours=3)
    time_interval = timedelta(seconds=60)  # TODO: the same amount like it would step
    current_time = start_time

    target_temp = []
    if looping:
        while current_time <= end_time:
            new_info = {
                'year': current_time.year,
                'month': current_time.month,
                'day': current_time.day,
                'hour': current_time.hour
            }

            target_temp.append(get_future_target_temp(new_info, args))
            current_time += time_interval
        return target_temp
    else:
        new_info = {
            'year': end_time.year,
            'month': end_time.month,
            'day': end_time.day,
            'hour': end_time.hour
        }
        target_temp.append(get_future_target_temp(new_info, args))
        return target_temp[0]


def run_simulation(trial, env, args, winter_summer=(True, True), param_testing=None, best_value=None) -> float:
    plot_action_yearly = pd.DataFrame(columns=['date', 'heating', 'cooling', 'average', 'outsideTemp', 'target_temp'])

    params = choose_opt(trial, param_testing)
    if param_testing is None or param_testing == 'dist':
        pid_heating = PID(10.1, 0.6951, 0.004900000000000001, setpoint=args.target_temp)

        pid_cooling = PID(0.2, 0.48710000000000003, 0.06670000000000001, setpoint=args.target_temp)
    else:
        if get_seasonal_type(winter_summer) == "winter":
            pid_heating = PID(**params, setpoint=args.target_temp)
            pid_cooling = PID(0.2, 0.48710000000000003, 0.06670000000000001, setpoint=args.target_temp)
        if get_seasonal_type(winter_summer) == "summer":
            pid_cooling = PID(**params, setpoint=args.target_temp)
            pid_heating = PID(10.1, 0.6951, 0.004900000000000001, setpoint=args.target_temp)
        if get_seasonal_type(winter_summer) == 'hybrid':
            pid_heating = PID(**params, setpoint=args.target_temp)
            pid_cooling = PID(**params, setpoint=args.target_temp)

    pid_heating.output_limits = (env.default_action_space.low[0], env.default_action_space.high[0])
    pid_cooling.output_limits = (env.default_action_space.low[1], env.default_action_space.high[1])

    rewards = []
    temp_sum_reward = 0
    for i in range(1):
        obs, info = env.reset()
        future_target_temp = future_temp(env, info, args)
        terminated = False
        current_month = 0
        df = read_epw_file(env.unwrapped.weather_files[0], env.spec.kwargs['config_params']['runperiod'])

        while not terminated:
            set_setpoints(info, env, args, pid_cooling, pid_heating)

            a = [0, 0] if all(winter_summer) else [0]
            cooling_index = 1 if all(winter_summer) else 0

            if check_summer_or_winter_by_time(info) == 'summer':

                if param_testing is None or param_testing == 'PID':
                    disturbance = calculate_disturbance(df, info, env, 1.18, 0.29)
                else:
                    disturbance = calculate_disturbance(df, info, env, **params)

                control_value = pid_cooling(env.obs_dict['Zone Air Temperature(SPACE1-1)'], disturbance)
                a[cooling_index] = (control_value - env.default_action_space.low[1]) / \
                                   (env.default_action_space.high[1] - env.default_action_space.low[1])

            else:

                if param_testing is None or param_testing == 'PID':
                    disturbance = calculate_disturbance(df, info, env, 0.97, 0.53)
                else:
                    disturbance = calculate_disturbance(df, info, env, **params)
                control_value = pid_heating(env.obs_dict['Zone Air Temperature(SPACE1-1)'], disturbance)

                a[0] = (control_value - env.default_action_space.low[0]) / \
                       (env.default_action_space.high[0] - env.default_action_space.low[0])

            obs, reward, terminated, truncated, info = env.step(a)
            rewards.append(reward)

            yearly_row = {'date': pd.to_datetime(datetime(info['year'], info['month'], info['day'], info['hour'])),
                          'average': env.obs_dict['Zone Air Temperature(SPACE1-1)'],
                          'outsideTemp': env.obs_dict['Site Outdoor Air Drybulb Temperature(Environment)'],
                          'cooling': env.obs_dict['Chiller Evaporator Outlet Temperature(Main Chiller)'],
                          'heating': env.obs_dict['Boiler Outlet Temperature(Main Boiler)'],
                          'target_temp': env.unwrapped.reward_fn.target_temperature}
            plot_action_yearly.loc[len(plot_action_yearly)] = yearly_row

            if info['month'] != current_month:  # display results every month
                current_month = info['month']
                print('Reward: ', sum(rewards), info)

            if best_value is not None and best_value > sum(
                    rewards):  # for optuna if the reward value is already higher then it stops
                raise optuna.TrialPruned()

            del future_target_temp[
                0]  # To get the next future target temp we need to delete the last one and add a new one
            future_target_temp.append(future_temp(env, info, args, False))
    if trial is None:
        plotting_pdf(plot_action_yearly, winter_summer)

    return sum(rewards)


def plotting_pdf(plot_action_yearly, winter_summer) -> None:
    plot_monthly = plot_action_yearly.resample('D', on='date').mean()
    plot_monthly = plot_monthly.groupby([plot_monthly.index.year, plot_monthly.index.month])

    plot_daily = plot_action_yearly.resample('H', on='date').mean()
    plot_daily = plot_daily.groupby([plot_daily.index.year, plot_daily.index.month])

    plot_action_yearly = plot_action_yearly.resample('M', on='date').mean()

    with PdfPages('multiple_plots.pdf') as pdf:
        year_fig, ax_year = plt.subplots()
        ax_year.set_title("Yearly Overall")

        if winter_summer[0]:
            for i, (month, group) in enumerate(plot_monthly):
                if (10 <= month[1] <= 12 or month[1] <= 5) and len(group) > 1:
                    fig1, ax = plt.subplots()
                    ax.set_title(f"{month[1]}-{group.index.year[0]} Monthly Overall")

                    montly_plot(ax, group, 'heating')

                    pdf.savefig(fig1, bbox_inches='tight')
                    plt.close(fig1)
            montly_plot(ax_year, plot_action_yearly, 'heating')
        if winter_summer[1]:
            for i, (month, group) in enumerate(plot_monthly):
                if 6 <= month[1] <= 9 and len(group) > 1:
                    fig1, ax = plt.subplots()
                    ax.set_title(f"{month[1]}-{group.index.year[0]} Monthly Overall")

                    montly_plot(ax, group, 'cooling')

                    pdf.savefig(fig1, bbox_inches='tight')
                    plt.close(fig1)
            montly_plot(ax_year, plot_action_yearly, 'cooling')

        plt.tight_layout()
        pdf.savefig(year_fig)


def choose_opt(trial, choosen_param) -> dict:
    match choosen_param:
        case "dist":
            weight_temp = trial.suggest_float('v1', 0.0, 1.5, step=0.01)
            weight_diffuse = trial.suggest_float('v2', 0.0, 1.5, step=0.01)
            params = {'v1': weight_temp, 'v2': weight_diffuse}
        case "PID":
            weight_propo = trial.suggest_float('Kp', 0.1, 0.5, step=0.0002)
            weight_error = trial.suggest_float('Ki', 0.0001, 1, step=0.0002)
            weight_derivative = trial.suggest_float('Kd', 0.0001, 1, step=0.0002)
            params = {'Kp': weight_propo, 'Ki': weight_error, 'Kd': weight_derivative}
        case "error":
            pass
        case _:
            params = None
            print("Nothing to optimize")

    return params


def montly_plot(plotter, monthly_data, heating_cooling) -> None:
    monthly_data.plot(y='average', ax=plotter, xlabel='Date', ylabel='Temperature(C)')
    monthly_data.plot(y='target_temp', ax=plotter, xlabel='Date', ylabel='Temperature(C)',
                      color='r', linestyle='--')
    monthly_data.plot(y='outsideTemp', ax=plotter, xlabel='Date', ylabel='Temperature(C)')
    monthly_data.plot(y=heating_cooling, ax=plotter, secondary_y=True, xlabel='Date', ylabel='Water Temperature(C)')
    plotter.fill_between(monthly_data.index, y1=monthly_data['target_temp'] + 0.5, y2=monthly_data['average'],
                         color="orange", alpha=0.4, interpolate=True)
    plotter.fill_between(monthly_data.index, y1=monthly_data['target_temp'] - 0.5, y2=monthly_data['average'],
                         color="orange", alpha=0.4, interpolate=True)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="ai")
    parser.add_argument("-opt", "-optuna", type=bool, default=False)
    parser.add_argument("-opt_var", "-optuna_variable", type=str, default="PID")
    parser.add_argument("-seas", "-seasonal", type=str, default='hybrid')
    parser.add_argument("-target_temp", "--target-temp", type=float, default=20)
    parser.add_argument("-off_winter_temp", "--off_days_winter_temp", type=float, default=18)
    parser.add_argument("-off_summer_temp", "--off_days_summer_temp", type=float, default=22)

    args = parser.parse_args()
    return args
