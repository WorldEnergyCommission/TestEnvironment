import math
from datetime import datetime, timedelta


def get_winter_start_time() -> tuple[int, int, int]:
    """get the winter start date"""
    return 1, 10, 2018


def get_winter_end_time() -> tuple[int, int, int]:
    """get the winter end date"""
    return 31, 5, 2019


def get_winter_time_range() -> tuple[int, int, int, int, int, int]:
    """get the winter time frame"""
    return get_winter_start_time()[0], get_winter_start_time()[1], get_winter_start_time()[2], \
        get_winter_end_time()[0], get_winter_end_time()[1], get_winter_end_time()[2]


def get_heating_time_range_for_optimization(hours_per_episode: int) -> tuple[int, int, int, int, int, int]:
    """compute heating time range for optimization"""

    start_time = datetime(get_winter_start_time()[2], get_winter_start_time()[1], get_winter_start_time()[0])
    end_time = start_time + timedelta(days=math.ceil(hours_per_episode / 24) + 1)

    return start_time.day, start_time.month, start_time.year, \
        end_time.day, end_time.month, end_time.year


def get_summer_start_time() -> tuple[int, int, int]:
    """get the winter start date"""
    return 1, 6, 2019


def get_summer_end_time() -> tuple[int, int, int]:
    """get the summer end date"""
    return 30, 9, 2019


def get_summer_time_range() -> tuple[int, int, int, int, int, int]:
    """get the summer time frame"""
    return get_summer_start_time()[0], get_summer_start_time()[1], get_summer_start_time()[2], \
        get_summer_end_time()[0], get_summer_end_time()[1], get_summer_end_time()[2]


def get_year_time_range() -> tuple[int, int, int, int, int, int]:
    """get the year time frame"""
    return get_winter_start_time()[0], get_winter_start_time()[1], get_winter_start_time()[2], \
        get_summer_end_time()[0], get_summer_end_time()[1], get_summer_end_time()[2]
