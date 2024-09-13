import gymnasium as gym
import numpy as np

from building_simulation import get_room_temperature_variable_names, get_building_file_abbreviation
from constants import DEFAULT_TIME_VARIABLES
from reward import get_average_room_temperature


def get_observation_variable_names(env: gym.Env) -> tuple[str, ...]:
    """get observation variable names"""
    return tuple(env.unwrapped.time_variables) + tuple(env.unwrapped.variables.keys()) + tuple(env.unwrapped.meters)


def get_default_outdoor_temperature_name() -> str:
    """get the outdoor temperature variable name"""
    return 'outdoor_temperature'


def get_default_diffuse_solar_radiation_name() -> str:
    """get the diffuse solar radiation variable name"""
    return 'diffuse_solar_radiation'


def get_default_direct_solar_radiation_name() -> str:
    """get the direct solar radiation variable name"""
    return 'direct_solar_radiation'


class ObservationWrapper(gym.ObservationWrapper):
    """wrapper that narrows down the observation space and fills it with useful information
       like the current average indoor room temperature and the current setpoint temperature"""

    def __init__(self, env: gym.Env, setpoint: float) -> None:
        """create the wrapper and initialize the members"""
        super().__init__(env)
        self._setpoint = setpoint
        if not isinstance(self.env.observation_space, gym.spaces.Box):
            raise ValueError
        self.observation_space = gym.spaces.Box(
            low=self.env.observation_space.low[0],
            high=self.env.observation_space.high[0],
            shape=(5,),
            dtype=self.env.observation_space.dtype
        )
        self._observation_variable_order = get_observation_variable_names(self.env)
        self._temperature_variables = get_room_temperature_variable_names(
            get_building_file_abbreviation(self.env.unwrapped.building_file))

    def observation(self, obs: np.array) -> np.array:
        """only supply the most needed observation variables"""
        obs_dict = {x: y for x, y in zip(self._observation_variable_order, obs)}
        average_temperature_value = get_average_room_temperature(obs_dict, self._temperature_variables)
        return np.array([average_temperature_value,
                         self._setpoint,
                         obs_dict[get_default_outdoor_temperature_name()],
                         obs_dict[get_default_diffuse_solar_radiation_name()],
                         obs_dict[get_default_direct_solar_radiation_name()],
                         *[obs_dict[x] for x in DEFAULT_TIME_VARIABLES]])
