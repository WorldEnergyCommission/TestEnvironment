import datetime
import os

import pandas as pd
import requests

from ai.utils.math_utils import haversine
from ai.utils.request_utils import RequestSession, MEDIUM_TIMEOUT_SECONDS


def get_weather_api_key() -> str:
    """returns the api key from the environment"""

    return os.getenv('WEATHER_API_KEY')


def list_weather_sites() -> requests.Response:
    """list all weather sites in the response object"""

    params = {
        "service": "solarforecast",
        "action": "siteinfo",
        "format": "json",
        "key": get_weather_api_key()
    }

    url = "https://mdx.meteotest.ch/api_v1"

    return RequestSession.get_session().get(url=url,
                                            timeout=MEDIUM_TIMEOUT_SECONDS,
                                            params=params)


def create_weather_site(name: str, lat: float, long: float) -> requests.Response:
    """creates the specified weather site"""

    params = {
        "name": name,
        "latitude": lat,
        "longitude": long,
        "service": "solarforecast",
        "action": "siteadd",
        "key": get_weather_api_key(),
        "format": "json"
    }

    url = "https://mdx.meteotest.ch/api_v1"

    return RequestSession.get_session().get(url=url,
                                            timeout=MEDIUM_TIMEOUT_SECONDS,
                                            params=params)


def delete_weather_site(site_id: int) -> requests.Response:
    """deletes the specified weather site"""

    params = {
        "site_id": site_id,
        "service": "solarforecast",
        "action": "sitedelete",
        "key": get_weather_api_key(),
        "format": "json"
    }

    url = "https://mdx.meteotest.ch/api_v1"

    return RequestSession.get_session().get(url=url,
                                            timeout=MEDIUM_TIMEOUT_SECONDS,
                                            params=params)


def get_nearest_site(long: float, lat: float) -> tuple[int, float, float]:
    """determines the nearest site for the specified longitude and latitude or 0 when no site has been found"""

    sites = list_weather_sites().json()["payload"]["solarforecast"]["sites"]
    if sites == []:
        sites = {}
    nearest_site, nearest_longitude, nearest_latitude, nearest_distance = 0, 0.0, 0.0, 5.0

    for site, attr in sites.items():
        site_longitude, site_latitude = attr["longitude"], attr["latitude"]
        r = haversine(site_longitude, site_latitude, long, lat)
        if r < nearest_distance:
            nearest_site = int(site)
            nearest_longitude, nearest_latitude = site_longitude, site_latitude
            nearest_distance = r

    return nearest_site, nearest_longitude, nearest_latitude


def fetch_forecast(site_id: int, action: str = "getforecast_cloudmove", control: bool = False) -> pd.DataFrame:
    """fetch a weather forecast from the meteotest api"""

    if action not in ["getsolarsat", "getforecast", "getforecast_cloudmove"]:
        raise ValueError("unknown action for weather forecast")

    params = {"key": get_weather_api_key(),
              "site_id": site_id,
              "action": action,
              "service": "solarforecast",
              "format": "json"}

    url = "https://mdx.meteotest.ch/api_v1"

    req = RequestSession.get_session().get(url=url,
                                           timeout=MEDIUM_TIMEOUT_SECONDS,
                                           params=params)

    data: dict = req.json()["payload"]["solarforecast"][str(site_id)]

    df = []

    for k, v in data.items():
        dt = datetime.datetime.strptime(k, "%Y-%m-%d %H:%M:%S")
        utc_time = dt.replace(tzinfo=datetime.timezone.utc)
        if control:
            df.append([int(utc_time.timestamp()), v["tt"], v["gh"]])
        else:
            df.append([int(utc_time.timestamp()), v["tt"],
                       v["gh"], v["dh"], v["gk"], v["dni"]])

    df = pd.DataFrame(df)
    if control:
        df.columns = ["ts", "temperature_forecast", "solar_radiation_forecast"]
    else:
        df.columns = ["ts", "temperature_forecast", "solar_radiation_forecast", "diffuse_radiation_forecast",
                      "inclined_radiation_forecast", "normal_radiation_forecast"]

    return df
