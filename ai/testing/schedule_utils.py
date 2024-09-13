from dataclasses import dataclass
from datetime import datetime, date, timedelta

import holidays
import pytz


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


def get_heating_weekly_temperature_config(work_hours_start_time: str, work_hours_end_time: str,
                                          heating_high_setpoint: float,
                                          heating_low_setpoint: float,
                                          working_on_saturdays: bool) -> WeeklyTemperatureConfig:
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
        saturday=heating_rest_day_daily_temperature_config,
        sunday=heating_workday_daily_temperature_config if working_on_saturdays else heating_rest_day_daily_temperature_config,
        holiday=heating_rest_day_daily_temperature_config,
        optimizationday=heating_workday_daily_temperature_config)


def get_cooling_weekly_temperature_config(work_hours_start_time: str, work_hours_end_time: str,
                                          cooling_high_setpoint: float,
                                          cooling_low_setpoint: float,
                                          working_on_saturdays: bool) -> WeeklyTemperatureConfig:
    cooling_workday_daily_temperature_config = DailyTemperatureConfig(time_based_setpoints=(
        TimeBasedSetpoint(start_time=work_hours_start_time, end_time=work_hours_end_time,
                          setpoint=cooling_low_setpoint),),
        default_setpoint=cooling_high_setpoint)
    cooling_rest_day_daily_temperature_config = DailyTemperatureConfig(time_based_setpoints=(),
                                                                       default_setpoint=cooling_high_setpoint)
    return WeeklyTemperatureConfig(
        monday=cooling_workday_daily_temperature_config,
        tuesday=cooling_workday_daily_temperature_config,
        wednesday=cooling_workday_daily_temperature_config,
        thursday=cooling_workday_daily_temperature_config,
        friday=cooling_workday_daily_temperature_config,
        saturday=cooling_rest_day_daily_temperature_config,
        sunday=cooling_workday_daily_temperature_config if working_on_saturdays else cooling_rest_day_daily_temperature_config,
        holiday=cooling_rest_day_daily_temperature_config, )


def get_setpoint_for_weekly_temperature_config_smoothed(
        weekly_temperature_config: WeeklyTemperatureConfig, naive_datetime: datetime, tz: str, country: str,
        smoothing_fc: str, smoothing_window_size: int, smoothing_offset: str = "centered",
        optimization: bool = False) -> float:
    if smoothing_window_size % 2 == 0: raise ValueError

    current_sp = get_setpoint_for_weekly_temperature_config(weekly_temperature_config, naive_datetime, tz, country,
                                                            optimization)
    window_start_sp = get_setpoint_for_weekly_temperature_config(weekly_temperature_config, naive_datetime + timedelta(
        minutes=-int(smoothing_window_size / 2)), tz, country, optimization)
    window_end_sp = get_setpoint_for_weekly_temperature_config(weekly_temperature_config, naive_datetime + timedelta(
        minutes=int(smoothing_window_size / 2) + 1), tz, country, optimization)

    if (current_sp != window_start_sp) or (current_sp != window_end_sp):

        match smoothing_offset:
            # smoothing is centered around setpoint change 
            case "centered":
                window_range = range(int(-smoothing_window_size / 2), int(smoothing_window_size / 2) + 1)
            # smoothing starts at setpoint change
            case "start":
                window_range = range(-smoothing_window_size, 1)
            # smoothing ends at setpoint change
            case "end":
                window_range = range(0, smoothing_window_size + 1)
            case _:
                raise ValueError

        window_setpoints = []
        for delta_minutes in window_range:
            datetime = naive_datetime + timedelta(minutes=delta_minutes)
            window_setpoints.append(
                get_setpoint_for_weekly_temperature_config(weekly_temperature_config, datetime, tz, country,
                                                           optimization))

        if smoothing_fc in globals():
            return globals()[smoothing_fc](window_setpoints, smoothing_offset).calculate()


        else:
            raise ValueError
    else:
        return current_sp


def get_setpoint_for_weekly_temperature_config(
        weekly_temperature_config: WeeklyTemperatureConfig, naive_datetime: datetime, tz: str, country: str,
        optimization: bool) -> float:
    """the passed datetime object must have no timezone information passed to it, the country must be in ISO notation"""
    datetime_value = naive_datetime.replace(tzinfo=pytz.timezone(tz))
    current_time = datetime_value.strftime('%H:%M')
    if optimization:
        return get_setpoint_for_daily_temperature_config(weekly_temperature_config.optimizationday, current_time)

    if datetime_value.date() in holidays.country_holidays(country=country):
        return get_setpoint_for_daily_temperature_config(weekly_temperature_config.holiday, current_time)
    match datetime_value.weekday():
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


def get_setpoint_for_daily_temperature_config(
        daily_temperature_config: DailyTemperatureConfig, time: str) -> float:
    """returns the correct setpoint based on the local time"""
    matching_time_based_setpoints = list(
        filter(lambda x: does_time_match_time_based_setpoint(time, x), daily_temperature_config.time_based_setpoints))
    if len(matching_time_based_setpoints) == 0:
        return daily_temperature_config.default_setpoint
    else:
        return matching_time_based_setpoints[0].setpoint


def get_setpoint_for_daily_temperature_config_new(
        daily_temperature_config: DailyTemperatureConfig, time: str) -> float:
    """returns the correct setpoint based on the local time"""
    print(time)
    ahead_time_minutes = 30
    matching_time_based_setpoints = list(
        filter(lambda x: does_time_match_time_based_setpoint(time, x), daily_temperature_config.time_based_setpoints))

    matching_time_based_setpoints_ahead = list(
        filter(lambda x: does_time_match_time_based_setpoint(time, x, ahead=ahead_time_minutes),
               daily_temperature_config.time_based_setpoints))

    current_setpoint = 1 if len(matching_time_based_setpoints) > 0 else 0
    ahead_setpoint = 1 if len(matching_time_based_setpoints_ahead) > 0 else 0

    if (current_setpoint + ahead_setpoint) == 0:
        return daily_temperature_config.default_setpoint

    elif (current_setpoint + ahead_setpoint) == 2:
        return matching_time_based_setpoints[0].setpoint

    elif (current_setpoint == 0) and (ahead_setpoint == 1):
        return get_smoothed_setpoint(time, matching_time_based_setpoints_ahead[0],
                                     daily_temperature_config.default_setpoint, ahead_time_minutes)

    elif (current_setpoint == 1) and (ahead_setpoint == 0):
        return get_smoothed_setpoint(time, matching_time_based_setpoints[0], daily_temperature_config.default_setpoint,
                                     ahead_time_minutes, falling=True)

    else:
        raise ValueError


def get_smoothed_setpoint(time: str, time_based_setpoint: TimeBasedSetpoint, default_setpoint: float,
                          ahead_time_minutes: int, falling: bool = False) -> float:
    """returns the smoothed setpoint based on a linear approximation"""

    current_date = date.today()

    k = (time_based_setpoint.setpoint - default_setpoint) / ahead_time_minutes

    if falling:
        t_end = datetime.combine(current_date, datetime.strptime(time_based_setpoint.end_time, '%H:%M').time())
        k = -k
        d = time_based_setpoint.setpoint

    else:
        t_end = datetime.combine(current_date, datetime.strptime(time_based_setpoint.start_time, '%H:%M').time())
        d = default_setpoint

    t_start = t_end - timedelta(minutes=ahead_time_minutes)
    t_now = datetime.combine(current_date, datetime.strptime(time, '%H:%M').time())

    x = (t_now - t_start).seconds / 60

    return k * x + d


def does_time_match_time_based_setpoint(time: str, time_based_setpoint: TimeBasedSetpoint, ahead: int = -1) -> bool:
    """check if time matches time based setpoint"""
    current_date = date.today()
    start_datetime = datetime.combine(current_date, datetime.strptime(time_based_setpoint.start_time, '%H:%M').time())
    end_datetime = datetime.combine(current_date, datetime.strptime(time_based_setpoint.end_time, '%H:%M').time())
    check_time = datetime.combine(current_date, datetime.strptime(time, '%H:%M').time())

    if ahead != -1:
        check_time = check_time + timedelta(minutes=ahead)

    if start_datetime <= check_time <= end_datetime:
        return True
    else:
        return False
