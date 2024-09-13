from dataclasses import dataclass
from datetime import timedelta, date, datetime
from typing import Callable

import holidays

from ai.utils.smoothing_function_utils import WindowOffset


@dataclass(frozen=True, order=True, kw_only=True)
class TimeBasedSetpoint:
    """structure for time based setpoints"""

    start_time: str
    end_time: str
    setpoint: float


@dataclass(frozen=True, order=True, kw_only=True)
class DailyTemperatureConfig:
    """structure for daily setpoint configuration"""

    time_based_setpoints: tuple[TimeBasedSetpoint, ...]
    default_setpoint: float


@dataclass(frozen=True, order=True, kw_only=True)
class WeeklyTemperatureConfig:
    """structure for weekly setpoint configuration"""

    monday: DailyTemperatureConfig
    tuesday: DailyTemperatureConfig
    wednesday: DailyTemperatureConfig
    thursday: DailyTemperatureConfig
    friday: DailyTemperatureConfig
    saturday: DailyTemperatureConfig
    sunday: DailyTemperatureConfig
    holiday: DailyTemperatureConfig
    optimizationday: DailyTemperatureConfig
    country: str
    smoothing_function_config: tuple[Callable[[list[float]], float], int, WindowOffset]


def get_heating_weekly_temperature_config(
        work_hours_start_time: str,
        work_hours_end_time: str,
        heating_high_setpoint: float,
        heating_low_setpoint: float,
        working_on_saturdays: bool,
        country: str,
        smoothing_function_config: tuple[Callable[[list[float]], float], int, WindowOffset]) -> WeeklyTemperatureConfig:
    """construct a weekly temperature schedule with simple parameters"""

    heating_workday_daily_temperature_config = DailyTemperatureConfig(time_based_setpoints=(
        TimeBasedSetpoint(start_time=work_hours_start_time, end_time=work_hours_end_time,
                          setpoint=heating_high_setpoint),),
        default_setpoint=heating_low_setpoint)
    heating_rest_day_daily_temperature_config = DailyTemperatureConfig(time_based_setpoints=(),
                                                                       default_setpoint=heating_low_setpoint)
    return WeeklyTemperatureConfig(
        monday=heating_workday_daily_temperature_config,
        tuesday=heating_workday_daily_temperature_config,
        wednesday=heating_workday_daily_temperature_config,
        thursday=heating_workday_daily_temperature_config,
        friday=heating_workday_daily_temperature_config,
        saturday=heating_workday_daily_temperature_config
        if working_on_saturdays else heating_rest_day_daily_temperature_config,
        sunday=heating_rest_day_daily_temperature_config,
        holiday=heating_rest_day_daily_temperature_config,
        optimizationday=heating_workday_daily_temperature_config,
        country=country,
        smoothing_function_config=smoothing_function_config)


def get_weekly_temperature_config_constant(
        setpoint: float,
        country: str,
        smoothing_function_config: tuple[Callable[[list[float]], float], int, WindowOffset]) -> WeeklyTemperatureConfig:
    """construct a constant weekly temperature schedule with simple parameters"""

    daily_temperature_config = DailyTemperatureConfig(time_based_setpoints=(),
                                                      default_setpoint=setpoint)
    return WeeklyTemperatureConfig(
        monday=daily_temperature_config,
        tuesday=daily_temperature_config,
        wednesday=daily_temperature_config,
        thursday=daily_temperature_config,
        friday=daily_temperature_config,
        saturday=daily_temperature_config,
        sunday=daily_temperature_config,
        holiday=daily_temperature_config,
        optimizationday=daily_temperature_config,
        country=country,
        smoothing_function_config=smoothing_function_config)


def does_time_match_time_based_setpoint(time: str, time_based_setpoint: TimeBasedSetpoint) -> bool:
    """check if time matches time based setpoint"""

    current_date = date.today()
    start_datetime = datetime.combine(current_date, datetime.strptime(time_based_setpoint.start_time, '%H:%M').time())
    end_datetime = datetime.combine(current_date, datetime.strptime(time_based_setpoint.end_time, '%H:%M').time())
    check_time = datetime.combine(current_date, datetime.strptime(time, '%H:%M').time())

    if start_datetime <= check_time <= end_datetime:
        return True
    else:
        return False


def get_setpoint_for_daily_temperature_config(
        daily_temperature_config: DailyTemperatureConfig, time: str) -> float:
    """returns the correct setpoint based on the local time"""

    matching_time_based_setpoints = list(
        filter(lambda x: does_time_match_time_based_setpoint(time, x), daily_temperature_config.time_based_setpoints))
    if len(matching_time_based_setpoints) == 0:
        return daily_temperature_config.default_setpoint
    else:
        return matching_time_based_setpoints[0].setpoint


def get_setpoint_for_weekly_temperature_config(
        weekly_temperature_config: WeeklyTemperatureConfig,
        current_datetime: datetime,
        optimization: bool) -> float:
    """the passed datetime object must have a timezone information, the country must be in ISO notation"""

    current_time = current_datetime.strftime('%H:%M')

    # during optimization we want to test the controller against a real workload
    if optimization:
        return get_setpoint_for_daily_temperature_config(weekly_temperature_config.optimizationday, current_time)

    # there is a special configuration for holidays
    if current_datetime.date() in holidays.country_holidays(country=weekly_temperature_config.country):
        return get_setpoint_for_daily_temperature_config(weekly_temperature_config.holiday, current_time)

    # else use the config for the requested weekday
    match current_datetime.weekday():
        case 0:
            return get_setpoint_for_daily_temperature_config(weekly_temperature_config.monday, current_time)
        case 1:
            return get_setpoint_for_daily_temperature_config(weekly_temperature_config.tuesday, current_time)
        case 2:
            return get_setpoint_for_daily_temperature_config(weekly_temperature_config.wednesday, current_time)
        case 3:
            return get_setpoint_for_daily_temperature_config(weekly_temperature_config.thursday, current_time)
        case 4:
            return get_setpoint_for_daily_temperature_config(weekly_temperature_config.friday, current_time)
        case 5:
            return get_setpoint_for_daily_temperature_config(weekly_temperature_config.saturday, current_time)
        case 6:
            return get_setpoint_for_daily_temperature_config(weekly_temperature_config.sunday, current_time)
        case _:
            raise ValueError


def get_setpoint_for_weekly_temperature_config_smoothed(
        weekly_temperature_config: WeeklyTemperatureConfig,
        current_datetime: datetime,
        optimization: bool = False) -> float:
    """return a smoothened version of the requested setpoint"""

    # unpack the smoothening config
    smoothing_function, window_size_in_minutes, window_offset = weekly_temperature_config.smoothing_function_config

    # compute the window range
    match window_offset:
        # window is centered around the current time
        case WindowOffset.PRESENT:
            window_minutes_offsets = list(range(-(window_size_in_minutes // 2), window_size_in_minutes // 2 + 1))
        # window ends with the current time
        case WindowOffset.PAST:
            window_minutes_offsets = list(range(-window_size_in_minutes + 1, 1))
        # window starts with the current time
        case WindowOffset.FUTURE:
            window_minutes_offsets = list(range(0, window_size_in_minutes))
        case _:
            raise ValueError

    # compute the current setpoint and the ones for the window borders to check if a change happens
    # if there are two changes happening between these three detection points, the detection algorithm fails
    current_setpoint = get_setpoint_for_weekly_temperature_config(
        weekly_temperature_config, current_datetime,
        optimization)
    window_start_setpoint = get_setpoint_for_weekly_temperature_config(
        weekly_temperature_config,
        current_datetime + timedelta(minutes=window_minutes_offsets[0]),
        optimization)
    window_end_setpoint = get_setpoint_for_weekly_temperature_config(
        weekly_temperature_config,
        current_datetime + timedelta(minutes=window_minutes_offsets[-1]),
        optimization)

    if len({current_setpoint, window_start_setpoint, window_end_setpoint}) > 1:
        # if there is at least one change happening withing the window, smooth the setpoint values
        window_setpoints = [
            get_setpoint_for_weekly_temperature_config(
                weekly_temperature_config,
                current_datetime + timedelta(minutes=delta_minutes),
                optimization) for delta_minutes in window_minutes_offsets]
        return smoothing_function(window_setpoints)
    else:
        # if there are no changes happening in the window
        return current_setpoint
