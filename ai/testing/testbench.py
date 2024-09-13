import json
from datetime import datetime

import gymnasium as gym
import numpy as np
from reactivex.subject import BehaviorSubject

from building_simulation import register_environments, ControlType, create_env
from pid_controller import PidController
from schedule_utils import get_heating_weekly_temperature_config, get_cooling_weekly_temperature_config, \
    WeeklyTemperatureConfig, get_setpoint_for_weekly_temperature_config_smoothed


def get_naive_datetime_from_obs(obs: np.array) -> datetime:
    """get a naive datetime object from the simulator information dictionary"""

    year = int(obs[-5])
    month = int(obs[-4])
    day = int(obs[-3])
    hour = int(obs[-2])
    minute = int(obs[-1])

    if minute > 60:
        raise ValueError("Minute > 60")

    return datetime(year, month, day, hour, minute - 1, tzinfo=None)


def load_config():
    with open("config.json", "r") as json_file:
        json_file = json.load(json_file)

    config = json_file.get("default")
    config_name = json_file.get("use_set")
    # Load the chosen configuration set from the JSON file
    if config_name != "default":
        chosen_config = json_file.get(config_name, {})
        if not chosen_config:
            raise ValueError

        # Merge the chosen config into the default config, overwriting values
        config.update(chosen_config)

    return config


class TestSetup:
    """class that is used to test the controller"""

    def __init__(self, env: gym.Env,
                 pid_controller: PidController,
                 control_type: ControlType,
                 steps_per_trial: int,
                 setpoint: BehaviorSubject[float],
                 weekly_temperature_config: WeeklyTemperatureConfig,
                 timezone: str,
                 country: str,
                 config: dict):
        """initialize the class"""
        self._env = env
        self._pid_controller = pid_controller
        self._control_type = control_type
        self._steps_per_trial = steps_per_trial
        self._setpoint = setpoint
        self._weekly_temperature_config = weekly_temperature_config
        self._timezone = timezone
        self._country = country
        self._env_terminated = True
        self._current_observation, self._info = self._env.reset()
        self._setpoint.subscribe(on_next=lambda new_setpoint: self.update_setpoint_temperature(new_setpoint))
        self._config = config
        self.dt = 60 / config.get("timesteps_per_hour")
        self.mse = []

    def update_setpoint_temperature(self, setpoint: float):
        """update setpoint temperature in the simulator"""
        # set in observation wrapper
        self._env.env._setpoint = setpoint
        # set in reward function
        self._env.unwrapped.reward_fn._setpoint = setpoint

    def check_score_with_new_params(self, pid_controller: PidController) -> float:
        """benchmark the current controller parameters, TODO forecast must be in observation (future setpoint, weather params), disturbance vars implementation
           check if heating and cooling system are not influencing each other in sim, cooling systems should not be heating and heating system should not be cooling"""
        current_steps = 0
        rewards = []

        while current_steps < self._steps_per_trial:
            # first update the setpoint temperature
            new_setpoint = get_setpoint_for_weekly_temperature_config_smoothed(
                self._weekly_temperature_config, get_naive_datetime_from_obs(self._current_observation), self._timezone,
                self._country,
                smoothing_fc="mean",
                smoothing_window_size=31,
                smoothing_offset="centered",
                optimization=self._config.get("optimize"))

            print(
                f"Date: {self._current_observation[-3]:.0f}-{self._current_observation[-4]:.0f}-{self._current_observation[-5]:.0f} {self._current_observation[-2]:.0f}:{self._current_observation[-1]:.0f} -- SetPoint: {new_setpoint}/{self._current_observation[1]}")

            if self._setpoint.value != new_setpoint:
                # only update the setpoint if it has changed
                self._setpoint.on_next(new_setpoint)

            if self._env_terminated:
                self._current_observation, self._info = self._env.reset()

            average_temperature_value = self._current_observation[0]

            self._current_observation, reward, self._env_terminated, truncated, self._info = self._env.step(
                [pid_controller.compute_output(average_temperature_value, self.dt)])

            self.mse.append((self._current_observation[0] - self._current_observation[1]) ** 2)

            # if(self._current_observation[7]%2==1): print(f"{pid_controller._setpoint.value}   {average_temperature_value} : {pid_controller.compute_output(average_temperature_value)}  ")
            # print(f"{pid_controller._setpoint.value}   {average_temperature_value} : {pid_controller.compute_output(average_temperature_value)} ")
            # print(f"Date: {self._current_observation[-3]:.0f}-{self._current_observation[-4]:.0f}-{self._current_observation[-5]:.0f} {self._current_observation[-2]:.0f}:{self._current_observation[-1]:.0f}\
            # SetPoint: {self._current_observation[1]:.0f}\
            # Room Temp: {self._current_observation[0]:.0f}\
            # Outdoor Temp: {self._current_observation[2]:.0f}"
            # )

            rewards.append(reward)
            current_steps += 1

        if self._config.get("reset_after_trial"):
            self._env.reset()
            self._pid_controller.new_pid()

        return sum(rewards)


def main() -> None:
    # Now, you can choose a configuration set and initialize the config into variables

    config = load_config()

    # Initialize variables
    timesteps_per_hour = config.get("timesteps_per_hour")
    setpoint = BehaviorSubject(config.get("setpoint"))
    timezone = config.get("timezone")
    country = config.get("country")
    control_type = ControlType[config.get("control_type").upper()]
    trials = config.get("trials")
    hours_per_trial = config.get("hours_per_trial")
    reset_after_trial = config.get("reset_after_trial")
    work_hours_start_time = config.get("work_hours_start_time")
    work_hours_end_time = config.get("work_hours_end_time")
    working_on_saturdays = config.get("working_on_saturdays")

    match control_type:
        case ControlType.HEATING:
            high_setpoint = config.get("high_setpoint")
            low_setpoint = config.get("low_setpoint")
            weekly_temperature_config = get_heating_weekly_temperature_config(
                work_hours_start_time,
                work_hours_end_time, high_setpoint,
                low_setpoint, working_on_saturdays)
        case ControlType.COOLING:
            high_setpoint = 27
            low_setpoint = 24
            weekly_temperature_config = get_cooling_weekly_temperature_config(
                work_hours_start_time,
                work_hours_end_time, high_setpoint,
                low_setpoint, working_on_saturdays)
        case _:
            raise ValueError

    # set up the actors and the environment
    pid_controller = PidController(setpoint, (0, 1))
    environment_ids = register_environments(
        timesteps_per_hour=timesteps_per_hour,
        hours_per_trial=config.get("hours_per_trial") if config.get("reset_after_trial") else config.get(
            "hours_per_trial") * config.get("trials"),
        setpoint=setpoint,
        filter_building_files=('5zone_unitary_heat_only',),
        filter_weather_files=('const',),
        filter_control_types=(control_type,))

    env = create_env(environment_ids[0])

    # construct the test setup
    test_setup = TestSetup(env, pid_controller, control_type, timesteps_per_hour * hours_per_trial,
                           setpoint, weekly_temperature_config, timezone, country, config)

    # test_setup.check_score_with_new_params(pid_controller)
    pid_controller.start_optimization(test_setup.check_score_with_new_params, trials)

    # output the best found parameters
    pid_controller.print_current_params()

    mse = sum(test_setup.mse) / len(test_setup.mse)
    print(f"MSE: {mse}")


if __name__ == '__main__':
    main()
