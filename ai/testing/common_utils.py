from enum import Enum


class ControlType(Enum):
    """specify the mode the controller will be run in the environment"""
    HEATING = 'heating'
    COOLING = 'cooling'


def invert_mapping(mapping: dict[str, str]) -> dict[str, str]:
    """inverts the mapping of a dictionary"""
    return {y: x for x, y in mapping.items()}
