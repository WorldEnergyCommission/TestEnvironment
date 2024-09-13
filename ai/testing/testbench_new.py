import json
from datetime import datetime, timedelta

import gymnasium as gym
import numpy as np
from pid_controller_new import PidController
from setpoint_function_utils import WeeklyTemperatureConfig, get_heating_weekly_temperature_config
from smoothing_function_utils import (
    get_smoothing_function_based_on_name, SmoothingFunctionName, ReturnIndex, WindowOffset)

from ai.utils.reward_function_utils import get_squared_error_reward_config
from building_simulation import register_environments, ControlType, create_env


def get_naive_datetime_from_obs(obs: np.array) -> datetime:
    """get a naive datetime object from the simulator information dictionary"""

    year = int(obs[-5])
    month = int(obs[-4])
    day = int(obs[-3])
    hour = int(obs[-2])
    minute = int(obs[-1]) - 1

    if minute < 0 or minute > 59:
        raise ValueError('minute value is out of range')

    return datetime(year, month, day, hour, minute, tzinfo=None)


def load_config(config: dict | None = None) -> dict[str, ...]:
    """load the configuration from the json config"""

    if config == None:
        with open('config.json', 'r') as file:
            # read the json file
            config = json.load(file)

    # get the default config and the configuration name
    default_config = config.get('default')

    # update the default config with the mode values
    mode_name = config.get('mode')
    mode_config = config.get(mode_name, {})

    return {**default_config, **mode_config}


class TestSetup:
    """class that is used to test the controller"""

    def __init__(self,
                 env: gym.Env,
                 pid_controller: PidController,
                 num_trials: int,
                 hours_per_trial: int,
                 timesteps_per_hour: int,
                 weekly_temperature_config: WeeklyTemperatureConfig,
                 timezone: str,
                 country: str,
                 optimize: bool,
                 study_title: str,
                 reset_after_trial: bool):
        """initialize the class"""

        # save the passed properties
        self._env = env
        self._pid_controller = pid_controller
        self._num_trials = num_trials
        self._hours_per_trials = hours_per_trial
        self._timesteps_per_hour = timesteps_per_hour
        self._weekly_temperature_config = weekly_temperature_config
        self._timezone = timezone
        self._country = country
        self._optimize = optimize
        self._study_title = study_title
        self._reset_after_trial = reset_after_trial
        self.study_name = ""

        # initialize the state variables
        self._env_terminated = True
        self._current_observation, self._info = None, None
        self._current_naive_datetime = None

        # Metrics to logs
        self.rewards = []
        self.setpoint_history = []
        # self.parameter_history = []
        self.optimization_stats = dict()

    def update_setpoint_temperature(self, setpoint: float):
        """update setpoint temperature in the simulator"""

        # set in observation wrapper
        self._env.env._setpoint = setpoint
        # set in reward function
        self._env.unwrapped.reward_fn._setpoint = setpoint

    def run(self) -> None:
        """benchmark the current controller parameters, TODO forecast must be in observation (future setpoint, weather params), disturbance vars implementation
           check if heating and cooling system are not influencing each other in sim, cooling systems should not be heating and heating system should not be cooling"""
        setpoint_history = []

        # enable optimization of the controller
        if self._optimize:
            self._pid_controller.start_optimization(
                reward_config=get_squared_error_reward_config(),
                optimization_trials=self._num_trials,
                optimization_trial_seconds=self._hours_per_trials * 60 * 60,
                study_title=self._study_title)

            self.study_name = self._pid_controller.get_current_study_name()

        # summed reward for current trial
        trial_reward = 0

        # did the initial step, necessary for the interface
        did_initial_step = False

        # start the simulation runs
        for trial in range(0, self._num_trials):

            for hour in range(0, self._hours_per_trials):
                # the initial step leads to no progress in the interface as the controller
                # has not actively influenced the environment
                if did_initial_step:
                    correction_steps = 0
                else:
                    correction_steps = 1
                    did_initial_step = True

                # step through the environment steps
                for step in range(0, self._timesteps_per_hour + correction_steps):
                    if self._env_terminated:
                        self._current_observation, self._info = self._env.reset()

                    # correctly set the current naive datetime
                    if self._current_naive_datetime is None:
                        self._current_naive_datetime = get_naive_datetime_from_obs(self._current_observation)
                    else:
                        if 60 % self._timesteps_per_hour != 0:
                            raise ValueError
                        self._current_naive_datetime += timedelta(minutes=60 // self._timesteps_per_hour)

                    # get the current mean room temperature
                    mean_room_temperature_value = self._current_observation[0]

                    # update the current setpoint temperature in the wrappers
                    self.update_setpoint_temperature(self._pid_controller.get_current_setpoint_temperature())
                    self.setpoint_history.append(
                        (self._current_naive_datetime, self._pid_controller.get_current_setpoint_temperature()))

                    # make a step in the environment using the pid controller output
                    self._current_observation, _, self._env_terminated, _, self._info = self._env.step(
                        [self._pid_controller.get_output(
                            current_naive_datetime=self._current_naive_datetime,
                            mean_room_temperature=mean_room_temperature_value)])

                    # calc reward except for first step
                    if not trial == hour == step == 0:
                        score = self._pid_controller.reward_function(mean_room_temperature_value,
                                                                     self._pid_controller.get_current_setpoint_temperature())
                        trial_reward += score

            # save and reset reward after trial
            self.rewards.append(trial_reward)
            trial_reward = 0

            # if the environment should be reset after each trial
            if self._reset_after_trial:
                self._current_observation, self._info = self._env.reset()

        # store optimization stats and reward
        self.optimization_stats = self._pid_controller.optimization_run_stat_dict
        self.rewards.append(min(self.rewards))

        # close the environment
        self._env.close()


def main(config_set: dict | None = None) -> (dict, list, list, list):
    # you can choose a configuration set and initialize the config into variables
    config = load_config(config_set)

    # get the control type
    control_type = ControlType[config.get('control_type')]

    # construct the weekly temperature config
    match control_type:
        case ControlType.HEATING:
            weekly_temperature_config = get_heating_weekly_temperature_config(
                config.get('work_hours_start_time'),
                config.get('work_hours_end_time'),
                config.get('heating_high_setpoint'),
                config.get('heating_low_setpoint'),
                config.get('working_on_saturdays'))
        case _:
            raise ValueError

    # create the pid controller
    pid_controller = PidController(weekly_temperature_config=weekly_temperature_config,
                                   smoothing_function_config=get_smoothing_function_based_on_name(
                                       SmoothingFunctionName[config.get('smoothing_function_name')],
                                       window_size_in_minutes=config.get('window_size_in_minutes'),
                                       window_offset=WindowOffset[config.get('window_offset')],
                                       sigma=config.get('smoothing_function_sigma'),
                                       mode=config.get('smoothing_function_mode'),
                                       return_index=ReturnIndex[config.get('smoothing_function_return_index')]
                                   ),
                                   tz=config.get('tz'),
                                   country=config.get('country'))

    # calculate the hours of one simulation episode
    if config.get('reset_after_trial'):
        # each episode should have the trial duration such that each parameter set
        # has the same environment during the test
        hours_per_episode = config.get('hours_per_trial')
    else:
        # there should be a continous simulation with no resets between trials, the
        # trials are experiencing an environment like in the real world, so the episode
        # lasts for the whole testing procedure
        hours_per_episode = config.get('hours_per_trial') * config.get('trials')

    # create the environment
    environment_ids = register_environments(
        timesteps_per_hour=config.get('timesteps_per_hour'),
        hours_per_episode=hours_per_episode,
        filter_building_files=(config.get('building_file'),),
        filter_weather_files=(config.get('weather_file'),),
        filter_control_types=(control_type,))
    env = create_env(environment_ids[0])

    # create the study title
    study_title = f'{config.get("building_file")}-{config.get("weather_file")}-'
    f'{config.get("trials")}-{config.get("hours_per_trial")}-'
    f'{config.get("reset_after_trial")}-{config.get("optimize")}'

    # construct the test setup
    test_setup = TestSetup(env=env,
                           pid_controller=pid_controller,
                           num_trials=config.get('trials'),
                           hours_per_trial=config.get('hours_per_trial'),
                           timesteps_per_hour=config.get('timesteps_per_hour'),
                           weekly_temperature_config=weekly_temperature_config,
                           timezone=config.get('tz'),
                           country=config.get('country'),
                           optimize=config.get('optimize'),
                           study_title=study_title,
                           reset_after_trial=config.get('reset_after_trial'),
                           )

    # run the test setup
    test_setup.run()

    print(f"Reward: {test_setup.rewards}")

    return (config, test_setup)


if __name__ == '__main__':
    main()
