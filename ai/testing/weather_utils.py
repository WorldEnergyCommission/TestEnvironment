import os
import pathlib
import shutil

import sinergym
from epw import epw

from common_utils import invert_mapping


def get_weather_file_paths() -> list[pathlib.Path]:
    """returns all the paths of energyplus weather files"""
    return list(pathlib.Path('weather_data').glob('*.epw'))


def install_weather_files() -> None:
    """installs the weather files in the sinergym directory"""
    target_weather_dir = os.path.join(pathlib.Path(
        sinergym.__file__).parent, 'data', 'weather')
    for weather_file_path in get_weather_file_paths():
        shutil.copy(weather_file_path, target_weather_dir)
        ddy_file_path = os.path.join(
            weather_file_path.parent, f'{weather_file_path.stem}.ddy')
        shutil.copy(ddy_file_path, target_weather_dir)
        rain_file_path = os.path.join(
            weather_file_path.parent, f'{weather_file_path.stem}.rain')
        shutil.copy(rain_file_path, target_weather_dir)


def get_weather_file_mapping() -> dict[str, str]:
    """the mapping from full name to abbreviation"""
    return {
        'AUT_KA_Klagenfurt.AP.113310_TMYx.2007-2021.epw': 'klagenfurt',
        'AUT_OO_Linz.110600_TMYx.2007-2021.epw': 'linz',
        'AUT_ST_Graz.AP.112400_TMYx.2007-2021.epw': 'graz',
        'AUT_SZ_Salzburg.AP.111500_TMYx.2007-2021.epw': 'salzburg',
        'AUT_TR_Innsbruck.AP.111200_TMYx.2007-2021.epw': 'innsbruck',
        'AUT_WI_Wien-Innere.Stadt.110340_TMYx.2007-2021.epw': 'vienna',
        'AUT_WI_Wien-Innere.Stadt.110340_TMYx.2007-2021_day_const_temp.epw': 'const',
    }


def get_weather_file_abbreviation(epw_file: str) -> str:
    """the mapping from full weather file name to abbreviation"""
    return get_weather_file_mapping().get(epw_file, 'unknown')


def get_weather_file_name(abbreviation: str) -> str:
    """the mapping from abbreviation to full weather file name"""
    return invert_mapping(get_weather_file_mapping()).get(abbreviation, 'unknown')


def get_weather_variability() -> list[dict]:
    """use the weather files with a random noise"""
    return [{'weather_variability': (1.0, 0.0, 0.001)}]


def get_weather_files() -> list[dict]:
    """get all weather file paths"""
    return [{'weather_files': x.name} for x in get_weather_file_paths()]


def create_constant_weather(epw_in_fpath: str, temp_even_days: float, temp_odd_days: float) -> None:
    """ Creates weather files (epw, ddy, rain) based on existing weather file (epw) where odd and even day temperature can be set. 

    Args:
        epw_in_fpath (str): fpath of epw file.
        temp_even_days (float): constant temp for even days
        temp_odd_days (float): constant temp for odd days
    """
    # Create fpaths
    epw_out_fpath = epw_in_fpath.replace(".epw", "_day_const_temp.epw")

    DDY_IN_FPATH = epw_in_fpath.replace(".epw", ".ddy")
    DDY_OUT_FPATH = epw_out_fpath.replace(".epw", ".ddy")

    RAIN_IN_FPATH = epw_in_fpath.replace(".epw", ".rain")
    RAIN_OUT_FPATH = epw_out_fpath.replace(".epw", ".rain")

    # Manipulate epw file and save
    a = epw()
    a.read(epw_in_fpath)

    a.dataframe.loc[a.dataframe["Day"] %
                    2 == 0, 'Dry Bulb Temperature'] = temp_even_days
    a.dataframe.loc[a.dataframe["Day"] %
                    2 != 0, 'Dry Bulb Temperature'] = temp_odd_days

    a.write(epw_out_fpath)

    # Rename according ddy and rain files
    shutil.copy(DDY_IN_FPATH, DDY_OUT_FPATH)
    shutil.copy(RAIN_IN_FPATH, RAIN_OUT_FPATH)
