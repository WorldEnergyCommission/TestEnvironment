import logging
import multiprocessing
import typing

from ai.data_holder.load_monitor_data_holder import LoadMonitorDataHolder
from ai.interface.data_holder_factory import get_data_holder
from ai.interface.model_holder import ModelHolder
from ai.interface.model_holder_factory import get_model_holder
from ai.model_holder.ems_model_holder import EmsModelHolder
from ai.model_holder.load_monitor_model_holder import LoadMonitorModelHolder
from ai.model_holder.setpoint_optimizer_model_holder import \
    SetpointOptimizerModelHolder
from ai.utils.autarchy_utils import calculate_autarchy
from ai.utils.database_utils import DatabaseConnection
from ai.utils.model_utils import delete_request, save_request, update_request
from ai.utils.s3_utils import StoreMode
from ai.utils.weather_utils import create_weather_site, get_nearest_site
from ai.weather.weather_holder import WeatherHolder


def create_handler(r: dict, weather_sites: dict[str, typing.Type[WeatherHolder]],
                   model_holders: dict[str, typing.Type[ModelHolder]],
                   project_mappings: dict[str, str],
                   train_model_queue: multiprocessing.Queue) -> dict[str, object]:
    """create a new machine learning model"""

    # anomaly detection does not need an active weather site in the project, the other model types need an active site
    if "AnomalyDetection" not in r["data"]["type"]:
        if r["project_id"] not in weather_sites.keys():
            raise KeyError("no weather site in project")

    # every model needs a data holder,
    # it stores every static data and functions as an interface for the time series data
    dh = get_data_holder(r)

    # save the data holder to the database
    save_request(dh)

    # the model holder contains the data holder, the model and the status
    model_holder = get_model_holder(dh)
    ModelHolder.store_model_holder_to_s3(model_holder,
                                         dh_store=True, dh_store_mode=StoreMode.CREATE_AND_UPDATE,
                                         model_store=True, model_store_mode=StoreMode.CREATE_AND_UPDATE,
                                         common_status_store=True, common_status_store_mode=StoreMode.CREATE_AND_UPDATE,
                                         specific_status_store=True,
                                         specific_status_store_mode=StoreMode.CREATE_AND_UPDATE)
    model_holders[dh.device_id] = model_holder.__class__
    project_mappings[dh.device_id] = dh.project_id

    response = dh.to_dict()

    train_model_queue.put((dh.device_id, model_holder.__class__, False))

    return response


def list_handler(model_holders: dict[str, typing.Type[ModelHolder]],
                 project_mappings: dict[str, str], project: str | None = None) -> list[dict[str, object]]:
    """list all machine learning models for the respective project or all if no project is provided"""

    response = []
    for model_id, model_holder_type in model_holders.items():
        if project is None or project_mappings[model_id] == project:
            model_holder = ModelHolder.load_model_holder_from_s3(model_id, model_holder_type, model_load=False,
                                                                 status_load=False)
            response_obj = model_holder.get_dh_dict()
            response.append(response_obj)
    return response


def calculate_autarchy_handler(r: dict[str, list[str]], project_id: str, start: int, end: int) -> dict[str, float]:
    """calculate the autarchy score for the passed configuration"""

    if "pv" not in r:
        r["pv"] = []
    if "battery" not in r:
        r["battery"] = []
    return {"autarchy_score": calculate_autarchy(start, end, project_id, r["grid"], r["pv"], r["battery"])}


def get_handler(model_id: str, model_holders: dict[str, typing.Type[ModelHolder]]) -> dict[str, object]:
    """return the current state of a machine learning model"""

    model_holder = ModelHolder.load_model_holder_from_s3(
        model_id, model_holders[model_id], model_load=False)

    status_response = model_holder.get_status_dict()

    # get the static data from the dataholder
    dh_response = model_holder.get_dh_dict()

    # update the response with the dynamic status
    dh_response["data"]["meta"].update(status_response)

    return dh_response


def change_handler(r: dict, weather_sites: dict[str, typing.Type[WeatherHolder]], model_id: str,
                   model_holders: dict[str, typing.Type[ModelHolder]],
                   project_mappings: dict[str, str],
                   train_model_queue: multiprocessing.Queue) -> dict[str, object]:
    """this endpoint updates a machine learning model and retrains it"""

    old_model_holder = ModelHolder.load_model_holder_from_s3(model_id, model_holders[model_id], model_load=False,
                                                             status_load=False)

    r["favorite"] = old_model_holder.get_favorite()
    r["created_at"] = old_model_holder.get_created_at()
    r["id"] = model_id

    if r["project_id"] not in weather_sites.keys():
        raise KeyError("no weather site on project")

    if model_id not in model_holders.keys():
        raise KeyError("no model with this id")

    dh = get_data_holder(r, changed=True)

    update_request(dh)

    new_model_holder = get_model_holder(dh)
    ModelHolder.store_model_holder_to_s3(new_model_holder,
                                         dh_store=True, model_store=True,
                                         common_status_store=True, specific_status_store=True)
    model_holders[dh.device_id] = new_model_holder.__class__
    project_mappings[dh.device_id] = dh.project_id

    response = dh.to_dict()

    train_model_queue.put((dh.device_id, new_model_holder.__class__, False))

    return response


def favorites_handler(model_id: str, favorite: bool,
                      model_holders: dict[str, typing.Type[ModelHolder]]) -> dict[str, object]:
    """this endpoint sets or clears the favorite flag of a model"""

    model_holder = ModelHolder.load_model_holder_from_s3(model_id, model_holders[model_id], model_load=False,
                                                         status_load=False)
    model_holder.set_favorite(favorite)
    ModelHolder.store_model_holder_to_s3(model_holder, dh_store=True)
    update_request(model_holder.get_dh())
    return model_holder.get_dh_dict()


def delete_handler(model_id: str, model_holders: dict[str, typing.Type[ModelHolder]],
                   project_mappings: dict[str, str]) -> dict:
    """this deletes a machine learning model"""

    del model_holders[model_id]
    del project_mappings[model_id]
    ModelHolder.delete_model_holder_from_s3(model_id)
    delete_request(model_id)
    return {}


def settings_handler(settings: dict, model_id: str,
                     model_holders: dict[str, typing.Type[ModelHolder]]) -> dict[str, object]:
    """this handler changes settings for an ems or a setpoint optimizer model"""

    model_holder_type = model_holders[model_id]
    if issubclass(model_holder_type, EmsModelHolder):
        model_holder: EmsModelHolder = EmsModelHolder.load_model_holder_from_s3(
            model_id, model_load=False, status_load=False)
        model_holder.change_settings(settings)
        ModelHolder.store_model_holder_to_s3(model_holder, dh_store=True)
        return model_holder.get_dh_dict()
    elif issubclass(model_holder_type, SetpointOptimizerModelHolder):
        model_holder: SetpointOptimizerModelHolder = SetpointOptimizerModelHolder.load_model_holder_from_s3(
            model_id, model_load=False, status_load=False)
        model_holder.change_settings(settings)
        ModelHolder.store_model_holder_to_s3(model_holder, dh_store=True)
        return model_holder.get_dh_dict()
    elif issubclass(model_holder_type, LoadMonitorModelHolder):
        model_holder: LoadMonitorModelHolder = LoadMonitorModelHolder.load_model_holder_from_s3(
            model_id, model_load=False, status_load=False)
        model_holder.change_settings(settings)
        ModelHolder.store_model_holder_to_s3(model_holder, dh_store=True)
        return model_holder.get_dh_dict()
    else:
        raise TypeError("Current model can't update settings object")


def create_site_handler(r: dict, project: str,
                        weather_sites: dict[str, typing.Type[WeatherHolder]]) -> dict[str, object]:
    """this handler creates a new weather site"""

    logger = logging.getLogger()
    logger.debug('Creating site for %s', project)
    logger.debug('Creating weather sites %s', weather_sites)

    if project in weather_sites.keys():
        raise KeyError("project is already mapped to a weather site")

    site_id, site_longitude, site_latitude = get_nearest_site(
        r["longitude"], r["latitude"])

    logger.debug('Got nearest site %s', site_id)

    # if the site id is 0, it means that no near site has been found, if that's the case a new site must be created
    if site_id != 0:
        weather_holder = WeatherHolder(project, site_id, r["username"], r["password"], r["longitude"],
                                       r["latitude"], site_longitude, site_latitude)
    else:
        site = \
            create_weather_site(project, lat=r["latitude"], long=r["longitude"]).json()["payload"]["solarforecast"][
                "site"]
        
        logger.debug('Created weather site %s', site)
        weather_holder = WeatherHolder(project, int(site["id"]), r["username"], r["password"], r["longitude"],
                                       r["latitude"], site["longitude"], site["latitude"])

    weather_holder.to_db()
    WeatherHolder.store_weather_holder_to_s3(
        weather_holder, store_mode=StoreMode.CREATE_AND_UPDATE)
    weather_sites[project] = weather_holder.__class__

    logger.debug('Got weather holder %s', weather_holder)

    return weather_holder.to_dict()


def get_site_handler(project: str, weather_sites: dict[str, typing.Type[WeatherHolder]]) -> dict[str, bool]:
    """return if a project has a weather site or not"""

    return {"site_active": project in weather_sites.keys()}


def list_site_handler(weather_sites: dict[str, typing.Type[WeatherHolder]]) -> list[dict[str, object]]:
    """list all weather sites"""

    response = []
    for project_id, _ in weather_sites.items():
        weather_holder = WeatherHolder.load_weather_holder_from_s3(project_id)
        response.append(weather_holder.to_dict())
    return response


def delete_site_handler(project: str, weather_sites: dict[str, typing.Type[WeatherHolder]]) -> dict:
    """delete a weather site for a project"""

    with DatabaseConnection.get_connection() as conn:
        if project not in weather_sites.keys():
            raise KeyError("no weather site on project")
        with conn.cursor() as cur:
            cur.execute(
                "DELETE from stations where project_id = %s", (project,))
            conn.commit()
            WeatherHolder.delete_weather_holder_from_s3(project)
            del weather_sites[project]
    return {}


def change_spo_parameters_handler(
        parameters: dict, model_id: str, model_holders: dict[str, typing.Type[ModelHolder]]) -> dict[str, object]:
    """changes parameters for some curves in the setpoint optimizer"""

    model_holder_type = model_holders[model_id]
    if issubclass(model_holder_type, SetpointOptimizerModelHolder):
        model_holder: SetpointOptimizerModelHolder = SetpointOptimizerModelHolder.load_model_holder_from_s3(
            model_id, status_load=False)
        model_holder.change_parameters(parameters)
        ModelHolder.store_model_holder_to_s3(model_holder, model_store=True)
        return model_holder.get_dh_dict()
    else:
        raise KeyError("cannot edit this type of device")


def get_score_handler(model_id: str,
                      start: int, end: int,
                      model_holders: dict[str, typing.Type[ModelHolder]]) -> dict[str, float]:
    model_holder_type = model_holders[model_id]
    if issubclass(model_holder_type, LoadMonitorModelHolder):
        model_holder: LoadMonitorModelHolder = ModelHolder.load_model_holder_from_s3(
            model_id, model_holders[model_id], model_load=False)
        data_holder: LoadMonitorDataHolder = model_holder.get_dh()
        return {"score": data_holder.get_score(start, end)}
    else:
        raise KeyError("cannot get score for this type of device")


def get_report_handler(model_id: str,
                       start: int, end: int,
                       model_holders: dict[str, typing.Type[ModelHolder]]) -> dict[str, float]:
    model_holder_type = model_holders[model_id]
    if issubclass(model_holder_type, LoadMonitorModelHolder):
        model_holder: LoadMonitorModelHolder = ModelHolder.load_model_holder_from_s3(
            model_id, model_holders[model_id], model_load=False)
        data_holder: LoadMonitorDataHolder = model_holder.get_dh()
        return {"report": data_holder.get_report(start, end)}
    else:
        raise KeyError("cannot get score for this type of device")
