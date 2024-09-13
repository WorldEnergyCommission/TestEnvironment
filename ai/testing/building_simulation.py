import itertools

import gymnasium as gym
from gymnasium.envs.registration import register

from action_wrapper import ActionWrapper, ControlType
from building_utils import get_building_file_abbreviation, get_building_files, install_building_files, \
    get_room_temperature_variable_names
from observation_wrapper import ObservationWrapper
from reward import CustomReward
from time_utils import get_summer_time_range, get_heating_time_range_for_optimization
from weather_utils import get_weather_file_abbreviation, get_weather_variability, get_weather_files, \
    install_weather_files


def get_config_params(control_type: ControlType, timesteps_per_hour: int, hours_per_episode: int) -> dict:
    """get configuration parameters for the simulation"""
    match control_type:
        case ControlType.HEATING:
            runperiod = get_heating_time_range_for_optimization(hours_per_episode)
        case ControlType.COOLING:
            runperiod = get_summer_time_range()
        case _:
            raise ValueError
    return {'config_params': {
        'timesteps_per_hour': timesteps_per_hour,
        'runperiod': runperiod
    }}


def get_reward_kwargs_for_building(abbreviation: str, setpoint: float) -> dict:
    """get the correct reward kwargs for the specified building"""
    mapping = {
        'factory': {
            'temperature_variables': get_room_temperature_variable_names('factory'),
            'setpoint': setpoint,
        },
        '5zone_unitary_heat_only': {
            'temperature_variables': get_room_temperature_variable_names('5zone_unitary_heat_only'),
            'setpoint': setpoint,
        },
        '1zone_unitary_heat_only': {
            'temperature_variables': get_room_temperature_variable_names('1zone_unitary_heat_only'),
            'setpoint': setpoint,
        }
    }
    return mapping[abbreviation]


def register_environments(
        timesteps_per_hour: int,
        hours_per_episode: int,
        filter_building_files: tuple[str, ...] | None = None,
        filter_weather_files: tuple[str, ...] | None = None,
        filter_control_types: tuple[ControlType, ...] | None = None,
) -> list[str]:
    """registers the requested environments and returns their names"""
    install_weather_files()
    install_building_files()
    environment_dataset = itertools.product(
        filter(lambda x:
               filter_building_files is None or get_building_file_abbreviation(
                   x['building_file']) in filter_building_files,
               get_building_files()),
        filter(lambda x:
               filter_weather_files is None or get_weather_file_abbreviation(
                   x['weather_files']) in filter_weather_files,
               get_weather_files()),
        filter(lambda x:
               filter_control_types is None or x in filter_control_types,
               [y for y in ControlType]),
        get_weather_variability(), )

    env_names = []
    for building_file_data, weather_file_data, control_type_data, weather_variability_data in environment_dataset:
        env_name = f'{get_building_file_abbreviation(building_file_data["building_file"])}-' \
                   f'{get_weather_file_abbreviation(weather_file_data["weather_files"])}-' \
                   f'{control_type_data.value}'
        register(
            id=env_name,
            entry_point='sinergym.envs:EplusEnv',
            kwargs={
                **building_file_data,
                **weather_file_data,
                'flag_normalization': True,
                **weather_variability_data,
                'reward': CustomReward,
                'reward_kwargs': get_reward_kwargs_for_building(
                    get_building_file_abbreviation(building_file_data['building_file']), 0),
                'max_ep_data_store_num': 10,  # only store the last ten episodes
                'env_name': env_name,
                **get_config_params(control_type=control_type_data, timesteps_per_hour=timesteps_per_hour,
                                    hours_per_episode=hours_per_episode),
            })
        env_names.append(env_name)
    return env_names


def create_env(env_id: str) -> gym.Env:
    """create the simulation environment including all necessary wrappers"""
    environment = gym.make(env_id)
    return ActionWrapper(
        ObservationWrapper(environment, environment.spec.kwargs['reward_kwargs']['setpoint']))
