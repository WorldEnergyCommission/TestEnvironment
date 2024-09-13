from enum import Enum


class ControlType(Enum):
    """specify the mode the controller will be run in the environment"""

    HEATING_WATER = 'heating_water'
    HEATING_AIR = 'heating_air'
    COOLING_WATER = 'cooling_water'
    COOLING_AIR = 'cooling_air'
    HYBRID_WATER = 'hybrid_water'
    HYBRID_AIR = 'hybrid_air'
