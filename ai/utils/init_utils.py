import collections
import concurrent.futures
import functools
import logging
import multiprocessing
import typing
import time

import apscheduler.executors.pool
import apscheduler.schedulers.background
import apscheduler.triggers.cron
import deadpool

from ai.execution.threads import activate_heating_pumps_for_ems_thread, consumption_service_prediction_thread, \
    ems_prediction_thread, heartbeat_thread, history_anomaly_detection_prediction_thread, log_weather_thread, \
    pv_monitoring_service_prediction_thread, pv_production_service_prediction_thread, report_memory_usage_thread, \
    setpoint_optimizer_prediction_thread, stream_anomaly_detection_prediction_thread, train_model_daily_thread, \
    train_model_thread, load_monitor_prediction_thread
from ai.interface.data_holder_factory import get_data_holder
from ai.interface.model_holder import ModelHolder
from ai.interface.model_holder_factory import get_model_holder
from ai.model_holder.consumption_service_model_holder import ConsumptionServiceModelHolder
from ai.model_holder.ems_model_holder import EmsModelHolder
from ai.model_holder.history_anomaly_detection_model_holder import HistoryAnomalyDetectionModelHolder
from ai.model_holder.pv_monitoring_service_model_holder import PvMonitoringServiceModelHolder
from ai.model_holder.pv_production_service_model_holder import PvProductionServiceModelHolder
from ai.model_holder.setpoint_optimizer_model_holder import SetpointOptimizerModelHolder
from ai.model_holder.stream_anomaly_detection_model_holder import StreamAnomalyDetectionModelHolder
from ai.model_holder.load_monitor_model_holder import LoadMonitorModelHolder
from ai.utils.database_utils import DatabaseConnection
from ai.utils.env_utils import is_development_environment
from ai.utils.multiprocessing_utils import Manager, start_job_in_executor, alternate_heartbeat
from ai.utils.multiprocessing_utils import get_executor_options, Priority
from ai.utils.s3_utils import StoreMode
from ai.weather.weather_holder import WeatherHolder
from ai.utils.multiprocessing_utils import publish_job_to_message_queue,  purge_job_queue, get_executor_class


def init_weather_site(row: ..., result: dict[str, typing.Type[WeatherHolder]]) -> None:
    """initializes a single weather site"""

    logging.debug(f"starting reading of weather site {row[0]} ...")

    weather_holder = WeatherHolder.from_db_row(row)
    WeatherHolder.store_weather_holder_to_s3(
        weather_holder, store_mode=StoreMode.CREATE_AND_UPDATE)
    result[str(row[0])] = weather_holder.__class__

    logging.debug(f"finished reading of weather site {row[0]}")


def init_all_weather_sites() -> dict[str, typing.Type[WeatherHolder]]:
    """initializes all weather sites from the database connection"""

    with DatabaseConnection.get_connection() as conn:
        with conn.cursor() as cur:
            select_query = "SELECT project_id, site_id, project_longitude, project_latitude, site_longitude, " \
                           "site_latitude, username, password from stations"
            cur.execute(select_query)
            rows = cur.fetchall()

        result = Manager.get().dict()

        logging.info("start reading weather sites")

        with concurrent.futures.ThreadPoolExecutor() as executor:
            executor.map(functools.partial(
                init_weather_site, result=result), rows)
            executor.shutdown(wait=True)

        logging.info("done reading weather sites")

        return result


def get_percentage_of_total(percentage: float, total: int, minimum: int = 1) -> int:
    """compute the right amount of resources"""

    return max(int(percentage * total), minimum)


def get_scheduler(weather_sites: dict[str, typing.Type[WeatherHolder]],
                  model_holders: dict[str, typing.Type[ModelHolder]],
                  global_state: multiprocessing.managers.Namespace,
                  log_memory: bool = False,
                  process_worker_multiplier: int = 4) -> apscheduler.schedulers.background.BackgroundScheduler:
    """starts a scheduler which runs processes in fixed intervals
    (heartbeat, weather logging, model prediction/training, heating pump activation)"""

    # get cpu count
    cpu_count = multiprocessing.cpu_count()
    # log the available processors
    logging.info("available amount of CPUs: %s", cpu_count)

    # create the scheduler object, all scheduled jobs are executed in threads
    # these jobs will redirect the work to the below pools instead of creating pools themselves
    # this is necessary as the amount of models is changing and only the job types are fixed in advance
    # this should make the resource usage more predictable, as the amount of processes/threads is fixed
    # this thread pool should be bigger than the amount of different jobs that are added with add_job
    scheduler = apscheduler.schedulers.background.BackgroundScheduler()

    # create the executor pool
    # compute the amount of process workers
    process_workers = cpu_count * process_worker_multiplier
    thread_pool = get_executor_class(False)(
        **get_executor_options(False, global_state.logging_queue, global_state.log_level, process_workers))

    # create the different schedules needed for the threads
    daily_cron = apscheduler.triggers.cron.CronTrigger(
        day_of_week='*', hour='3', minute='0', timezone='Europe/Vienna')
    min01_cron = apscheduler.triggers.cron.CronTrigger(
        day_of_week='*', hour='*', minute='*', timezone='Europe/Vienna')
    min05_cron = apscheduler.triggers.cron.CronTrigger(
        day_of_week='*', hour='*', minute='*/5', second='30', timezone='Europe/Vienna')
    min15_cron = apscheduler.triggers.cron.CronTrigger(
        day_of_week='*', hour='*', minute='3,18,33,48', timezone='Europe/Vienna')
    sec10_cron = apscheduler.triggers.cron.CronTrigger(
        day_of_week='*', hour='*', minute='*', second='*/10', timezone='Europe/Vienna')

    # eventually monitor memory consumption
    if log_memory:
        scheduler.add_job(func=report_memory_usage_thread, trigger=sec10_cron, args=(
            global_state.main_process_pid,))

    # setup network intensive periodic tasks
    scheduler.add_job(func=start_job_in_executor,
                      args=(log_weather_thread,
                            thread_pool,
                            weather_sites,
                            WeatherHolder,
                            (),
                            set_metrics_dict_entry_callback(global_state.metrics_timestamps, "log_weather_thread")),
                      trigger=min01_cron,
                      name="log_weather_thread")
    scheduler.add_job(func=start_job_in_executor,
                      args=(heartbeat_thread,
                            thread_pool,
                            model_holders,
                            ModelHolder,
                            (global_state,),
                            alternate_heartbeat,
                            (global_state,)),
                      trigger=min01_cron,
                      name="heartbeat_thread")

    scheduler.add_job(func=start_job_in_executor,
                      args=(activate_heating_pumps_for_ems_thread,
                            thread_pool,
                            model_holders,
                            EmsModelHolder,
                            global_state),
                      trigger=min15_cron,
                      name="activate_heating_pumps")

    # Message Queue Jobs
    # empty queue first
    purge_job_queue()

    # setup CPU intensive one-shot tasks
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(train_model_thread,
                            model_holders,
                            ModelHolder,
                            global_state.running_jobs,
                            'training_task_queue'),
                      name="train_all_models_once_thread")

    # setup (fast) prediction tasks
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(consumption_service_prediction_thread,
                            model_holders,
                            ConsumptionServiceModelHolder,
                            global_state.running_jobs,
                            'task_queue'),
                      trigger=min01_cron,
                      name="consumption_prediction")
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(history_anomaly_detection_prediction_thread,
                            model_holders,
                            HistoryAnomalyDetectionModelHolder,
                            global_state.running_jobs,
                            'task_queue'),
                      trigger=min01_cron,
                      name="history_anomaly_prediction")
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(stream_anomaly_detection_prediction_thread,
                            model_holders,
                            StreamAnomalyDetectionModelHolder,
                            global_state.running_jobs,
                            'task_queue'),
                      trigger=min01_cron,
                      name="stream_anomaly_prediction")
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(pv_monitoring_service_prediction_thread,
                            model_holders,
                            PvMonitoringServiceModelHolder,
                            global_state.running_jobs,
                            'task_queue'),
                      trigger=min15_cron,
                      name="pv_monitoring_prediction")
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(pv_production_service_prediction_thread,
                            model_holders,
                            PvProductionServiceModelHolder,
                            global_state.running_jobs,
                            'task_queue'),
                      trigger=min15_cron,
                      name="pv_production_prediction")
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(load_monitor_prediction_thread,
                            model_holders,
                            LoadMonitorModelHolder,
                            global_state.running_jobs,
                            'task_queue'),
                      trigger=min01_cron,
                      name="load_monitor_prediction")

    # setup CPU intensive periodic tasks
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(train_model_daily_thread,
                            model_holders,
                            (PvProductionServiceModelHolder,
                             ConsumptionServiceModelHolder, EmsModelHolder),
                            global_state.running_jobs,
                            'training_task_queue'),
                      trigger=daily_cron,
                      name="train_models_daily")
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(setpoint_optimizer_prediction_thread,
                            model_holders,
                            SetpointOptimizerModelHolder,
                            global_state.running_jobs,
                            'task_queue'),
                      trigger=min01_cron,
                      name="setpoint_prediction")
    scheduler.add_job(func=publish_job_to_message_queue,
                      args=(ems_prediction_thread,
                            model_holders,
                            EmsModelHolder,
                            global_state.running_jobs,
                            'task_queue'),
                      trigger=min05_cron,
                      name="ems_prediction")
    return scheduler


def init_model_holder(
        row: ..., model_holders: dict[str, typing.Type[ModelHolder]], project_mappings: dict[str, str]) -> None:
    """initialize just one model holder"""

    logging.debug(f"Starting reading of model {row[1]} ...")

    try:
        dh = get_data_holder(row[0], changed=True)
    except KeyError as e:
        logging.error(
            f"Error occurred during reading of model {row[1]}: {repr(e)}")
        return
    try:
        model_holder = get_model_holder(dh)
        # in the development environment you can start the ai server only for a single model holder type
        # just replace ModelHolder with the class that you want to test
        if is_development_environment() and not model_holder.is_instance_of(ModelHolder):
            return
        # models that are updated in the prediction should not be recreated at every startup
        model_status_store_mode = StoreMode.ONLY_CREATE
        ModelHolder.store_model_holder_to_s3(model_holder,
                                             dh_store=True,
                                             dh_store_mode=StoreMode.CREATE_AND_UPDATE,
                                             model_store=True,
                                             model_store_mode=model_status_store_mode,
                                             common_status_store=True,
                                             common_status_store_mode=model_status_store_mode,
                                             specific_status_store=True,
                                             specific_status_store_mode=model_status_store_mode)
        model_holders[dh.device_id] = model_holder.__class__
        project_mappings[dh.device_id] = dh.project_id
    except Exception as e:
        logging.error(
            f"Error occurred during reading of model {row[1]}: {repr(e)}")
        return

    logging.debug(f"Finished reading of model {row[1]}")


def init_all_model_holders() -> tuple[dict[str, typing.Type[ModelHolder]], dict[str, str]]:
    """initializes all model holders and states from the database connection"""

    with DatabaseConnection.get_connection() as conn:
        model_holders = Manager.get().dict()
        project_mappings = Manager.get().dict()
        with conn.cursor() as cur:
            cur.execute("SELECT r, id FROM models")
            rows = cur.fetchall()

        logging.info("start reading models")

        with concurrent.futures.ThreadPoolExecutor() as executor:
            executor.map(
                functools.partial(
                    init_model_holder,
                    model_holders=model_holders,
                    project_mappings=project_mappings),
                rows)
            executor.shutdown(wait=True)

        logging.info("done reading models")

        return model_holders, project_mappings


def init_metrics_timestamp_dict() -> dict[str, float]:
    """ get a dict for alle the metrics for which a thread handler should set the last runtime """
    ts_dict = Manager.get().dict()
    now = time.time()

    ts_dict['heartbeat_thread'] = now
    ts_dict['logweather_thread'] = now

    return ts_dict


def set_metrics_dict_entry_callback(dic: dict[str, float], key: str) -> collections.abc.Callable:
    def callback() -> None:
        dic[key] = time.time()
    return callback
