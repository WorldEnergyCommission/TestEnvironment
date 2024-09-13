
import datetime
import json
import requests
import logging


from ai.utils.database_utils import DatabaseConnection


WEEKDAYS = ['monday', 'tuesday', 'wednesday',
            'thursday', 'friday', 'saturday', 'sunday']


def find_recent_working_day(project_id: str) -> datetime.datetime:
    """finds the most recent workday from today using the operating hours and holidays stored in the database

    :return: most recent working day
    :rtype: datetime.datetime
    """

    day_delta = 1
    while True:

        # get day to check
        baseline_day = (datetime.datetime.today() -
                        datetime.timedelta(days=day_delta))

        if is_working_day(project_id, baseline_day.date()):
            return baseline_day

        # increase delta
        day_delta += 1

        if day_delta > 10:
            logging.error(
                "No working day found! Check opening hours configuration")
            return baseline_day


def get_weekday(check_date: datetime.date) -> str:
    return WEEKDAYS[check_date.weekday()]


def get_week_holiday(project_id: str, check_date: datetime.date, holidays=None, cached_data=None) -> str:
    """Get string name of weekday for a date, or holiday if set to holiday in project 

    :param project_id: Id of the project, should be a uuid
    :type project_id: str
    :param check_date: Date to check
    :type check_date: datetime.date
    :return: one of 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday' or 'holiday'
    :rtype: str
    """
    if is_holiday_with_cached_data(project_id, check_date, holidays=holidays, cached_data=cached_data):
        return "holiday"
    else:
        return WEEKDAYS[check_date.weekday()]


def is_working_day(project_id: str, check_date: datetime.date) -> bool:
    """checks if the given date is a working day

    :param check_date: date to check
    :type check_date: datetime.date
    :return: True if working day, False if not a working day
    :rtype: bool
    """

    operating_hours = load_project_operating_hours(project_id)

    if operating_hours is None:
        return False

    weekday = get_week_holiday(project_id, check_date)

    # check if baseline day is operating day
    return operating_hours[weekday]['enabled']


def is_holiday_with_cached_data(project_id: str, check_date: datetime.date, holidays=None, cached_data=None) -> bool:
    """checks if the given date is a holiday

    :param check_date: date to check
    :type check_date: datetime.date
    :return: True if holiday, False if non-holiday
    :rtype: bool
    """
    if cached_data is not None:
        for cached_holiday in cached_data:
            cached_holiday_date = datetime.datetime.strptime(
                cached_holiday["date"], "%Y-%m-%d").date()

            if cached_holiday_date == check_date:
                return True
    else:
        return is_holiday(project_id, check_date, holidays=holidays)


def is_holiday(project_id: str, check_date: datetime.date, holidays=None) -> bool:
    """checks if the given date is a holiday

    :param check_date: date to check
    :type check_date: datetime.date
    :return: True if holiday, False if non-holiday
    :rtype: bool
    """

    if holidays is None:
        hol = load_project_holidays(project_id)
    else:
        hol = holidays

    if hol is None:
        return False

    # Check custom holidays
    for custom_holiday in hol["customHolidays"]:
        custom_holiday_date = datetime.datetime.strptime(
            custom_holiday["date"], "%Y-%m-%d").date()

        if custom_holiday_date == check_date:
            return True

    # Check holiday calendar using openholidayapi
    if hol["holiday_calender_enabled"]:
        date_string = check_date.strftime("%Y-%m-%d")
        country = hol["holiday_calender"].upper()

        request = f"https://openholidaysapi.org/PublicHolidays?countryIsoCode={country}&languageIsoCode=DE&validFrom={date_string}&validTo={date_string}"
        x = requests.get(request)
        decoded_string = x.content.decode('utf-8')
        data = json.loads(decoded_string)

        for holiday in data:
            if holiday["nationwide"]:
                return True


def get_holiday_range(project_id: str, from_date: datetime.date, to_date: datetime.date, holidays=None) -> list[dict[str, str]]:
    """checks if the given date range includes holidays

    :param from_date: date range to check start
    :type from_date: datetime.date
    :param to_date: date range to check end
    :type to_date: datetime.date
    :return: list of holidays in the range
    :rtype: list[dict[str, str]]
    """
    data = []

    if holidays is None:
        hol = load_project_holidays(project_id)
    else:
        hol = holidays

    if hol is None:
        return data

    # Check custom holidays
    for custom_holiday in hol["customHolidays"]:
        custom_holiday_date = datetime.datetime.strptime(
            custom_holiday["date"], "%Y-%m-%d").date()
        data.append({
            "date": custom_holiday_date,
            "name": custom_holiday["name"]
        })

    # Check holiday calendar using openholidayapi
    if hol["holiday_calender_enabled"]:
        date_from_string = from_date.strftime("%Y-%m-%d")
        date_to_string = to_date.strftime("%Y-%m-%d")
        country = hol["holiday_calender"].upper()

        request = f"https://openholidaysapi.org/PublicHolidays?countryIsoCode={country}&languageIsoCode=DE&validFrom={date_from_string}&validTo={date_to_string}"
        x = requests.get(request)
        decoded_string = x.content.decode('utf-8')
        data = json.loads(decoded_string)
        for holiday in data:
            if holiday["nationwide"]:
                data.append({
                    "date": holiday["startDate"],
                    "name": holiday[0]["text"]
                })

    return data


def load_project_operating_hours(project_id: str) -> dict | None:
    """Load the operating hours json for a project
    """

    operating_hours = None
    try:
        query = f"SELECT payload from project_operating_hours WHERE project_id = '{project_id}' order BY created_at desc limit 1;"
        data = DatabaseConnection.get_data_from_query(
            query, ())
        logging.error(data)
        operating_hours = data[0].payload["operating_hours"]

    except Exception as e:
        logging.error(
            f'exception retrieving operating hours for {project_id}: {repr(e)}, data: {data}, query: {query}')

    return operating_hours


def load_project_holidays(project_id: str) -> dict | None:
    """ Load the holiday information for the project"""

    holidays = None    
    try:
        query = f"SELECT payload from project_holidays WHERE project_id = '{project_id}' order BY created_at desc limit 1;"
        holidays = DatabaseConnection.get_data_from_query(
            query, ())[0].payload

    except Exception as e:
        logging.error(
            f'exception retrieving holidays from DB for {project_id}: {repr(e)}')

    return holidays
