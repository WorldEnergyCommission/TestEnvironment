import os
import pathlib
import shutil

import sinergym

from common_utils import invert_mapping
from constants import DEFAULT_5ZONE_ACTION_SPACE_CONTINUOUS, DEFAULT_TIME_VARIABLES, DEFAULT_5ZONE_VARIABLES, \
    DEFAULT_5ZONE_METERS, DEFAULT_5ZONE_ACTUATORS


def get_room_temperature_variable_names(abbreviation: str) -> list[str]:
    """get room temperature variable names"""
    mapping = {
        'factory': [
            'air_temperature'
        ],
        '5zone_unitary_heat_only': [
            'air_temperature'
        ],
        '1zone_unitary_heat_only': [
            'air_temperature'
        ],
    }
    return mapping[abbreviation]


def get_building_file_abbreviation_mapping() -> dict[str, str]:
    """the mapping from full name to abbreviation"""
    return {
        'HVACTemplate-5ZoneVAVWaterCooled.epJSON': 'factory',
        'HVAC-5ZoneWaterHeatUnitary.epJSON': '5zone_unitary_heat_only',
        'HVAC_1Zone_Heat_Only.epJSON': '1zone_unitary_heat_only',
    }


def get_building_file_abbreviation(building_file: str) -> str:
    """returns the abbreviation from the full name"""
    return get_building_file_abbreviation_mapping().get(building_file, 'unknown')


def get_building_file_name(abbreviation: str) -> str:
    """returns the full name from the abbreviation"""
    return invert_mapping(get_building_file_abbreviation_mapping()).get(abbreviation, 'unknown')


def get_building_file_paths() -> list[pathlib.Path]:
    """list all the building file paths"""
    return list(pathlib.Path('building').glob('*.epJSON'))


def get_variables_file_paths() -> list[pathlib.Path]:
    """list all the variables file paths"""
    return list(pathlib.Path('variables').glob('*.rdd'))


def install_building_files() -> None:
    """installs the building and variable files in the sinergym directory"""
    target_building_dir = os.path.join(pathlib.Path(sinergym.__file__).parent, 'data', 'buildings')
    for building_file_path in get_building_file_paths():
        shutil.copy(building_file_path, target_building_dir)
    target_variables_dir = os.path.join(pathlib.Path(sinergym.__file__).parent, 'data', 'variables')
    for variable_file_path in get_variables_file_paths():
        shutil.copy(variable_file_path, target_variables_dir)


def get_building_files() -> list[dict]:
    """returns a list of all building files inclusive their configuration variables"""
    return [
        {
            'building_file': get_building_file_name('5zone_unitary_heat_only'),
            'action_space': DEFAULT_5ZONE_ACTION_SPACE_CONTINUOUS,
            'time_variables': DEFAULT_TIME_VARIABLES,
            'variables': DEFAULT_5ZONE_VARIABLES,
            'meters': DEFAULT_5ZONE_METERS,
            'actuators': DEFAULT_5ZONE_ACTUATORS,
            'action_mapping': {},
        }
    ]
