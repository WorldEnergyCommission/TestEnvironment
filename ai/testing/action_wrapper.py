import gymnasium as gym
import numpy as np

from building_utils import get_building_file_abbreviation, get_building_files
from common_utils import ControlType


def map_string_to_control_type(value: str) -> ControlType:
    """map string to control type"""
    match value:
        case 'heating':
            return ControlType.HEATING
        case 'cooling':
            return ControlType.COOLING
        case _:
            raise ValueError


def map_to_sinergym_range(power_value: float, is_cooling_value: bool):
    """map our range from 0 to 1 to the sinergym range from -1 to 1"""
    sinergym_range = power_value * 2 - 1
    if is_cooling_value:
        return -sinergym_range
    else:
        return sinergym_range


def get_action_space(control_type: ControlType):
    """get the action space from zero to one for heating and/or cooling,
       in hybrid mode the first input is heating (0-1) and the second input is cooling (0-1)"""
    match control_type:
        case ControlType.HEATING | ControlType.COOLING:
            size_of_box = 1
        case _:
            raise ValueError
    return gym.spaces.Box(
        low=np.array(np.zeros(size_of_box), dtype=np.float32),
        high=np.array(np.ones(size_of_box), dtype=np.float32),
        shape=(size_of_box,),
        dtype=np.float32
    )


class ActionWrapper(
    gym.ActionWrapper):
    def __init__(self, env: gym.Env):
        """instantiates the action wrapper"""
        super().__init__(env)
        self.building_file_abbreviation, _, self.control_type_name = env.spec.id.split('-')
        self.control_type = map_string_to_control_type(self.control_type_name)
        self.action_space = get_action_space(self.control_type)
        self.default_action_space, self.actuators = self.get_action_constants()
        self.heating_action_indices = self.get_action_indices(ControlType.HEATING)
        self.cooling_action_indices = self.get_action_indices(ControlType.COOLING)
        self.check_min_and_max_values()

    def check_min_and_max_values(self):
        """checks if all heating and cooling systems have the same bound"""
        heating_lower_bounds = self.default_action_space.low[self.heating_action_indices]
        heating_higher_bounds = self.default_action_space.high[self.heating_action_indices]
        if not np.all(heating_lower_bounds == heating_lower_bounds[0]) or not np.all(
                heating_higher_bounds == heating_higher_bounds[0]):
            raise ValueError
        # cooling_lower_bounds = self.default_action_space.low[self.cooling_action_indices]
        # cooling_higher_bounds = self.default_action_space.high[self.cooling_action_indices]
        # if not np.all(cooling_lower_bounds == cooling_lower_bounds[0]) or not np.all(
        #        cooling_higher_bounds == cooling_higher_bounds[0]):
        #    raise ValueError

    def get_action_constants(self):
        """returns the expected action space of the environment"""
        building_definitions = list(filter(lambda x:
                                           get_building_file_abbreviation(
                                               x['building_file']) in (self.building_file_abbreviation,),
                                           get_building_files()))[0]
        return building_definitions['action_space'], building_definitions['actuators']

    def action(self, action: np.ndarray) -> np.ndarray:
        """setting our output from 0 to 1 to -1 and 1 expected by sinergym,
           our output represents power where 1 denotes maximum power and 0 minimum power, that means
           1 denotes the highest water temperature when heating and the coldest water temperature when cooling,
           in sinergym the mapping is just a linear mapping, where -1 denotes the coldest temperature and
           1 denotes the highest temperature"""

        match self.control_type:
            case ControlType.HEATING:
                heating_sinergym_output = map_to_sinergym_range(action[0], False)
                cooling_sinergym_output = map_to_sinergym_range(0, True)  # default output with minimum power
            case ControlType.COOLING:
                heating_sinergym_output = map_to_sinergym_range(0, False)  # default output with minimum power
                cooling_sinergym_output = map_to_sinergym_range(action[0], True)
            case _:
                raise ValueError

        action = np.zeros(len(self.actuators))
        action[self.heating_action_indices] = heating_sinergym_output
        action[self.cooling_action_indices] = cooling_sinergym_output

        return action.astype(np.float32)

    def get_action_indices(self, control_type: ControlType):
        """get the indices of actions corresponding to the control type"""
        match control_type:
            case ControlType.HEATING:
                identification_function = lambda x: 'heating' in x.lower()
            case ControlType.COOLING:
                identification_function = lambda x: 'cooling' in x.lower()
            case _:
                raise ValueError
        return [index for index, variable in enumerate(self.actuators.keys()) if identification_function(variable)]
