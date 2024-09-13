import collections.abc
import concurrent.futures
import dataclasses
import datetime
import enum
import json
import logging
import logging.handlers
import multiprocessing
import multiprocessing.managers
import multiprocessing.process
import os
import time
import typing
import pika

import deadpool
import psutil

from ai.interface.model_holder import ModelHolder
from ai.model_holder.consumption_service_model_holder import ConsumptionServiceModelHolder
from ai.model_holder.ems_model_holder import EmsModelHolder
from ai.model_holder.history_anomaly_detection_model_holder \
    import HistoryAnomalyDetectionModelHolder
from ai.model_holder.pv_monitoring_service_model_holder import PvMonitoringServiceModelHolder
from ai.model_holder.pv_production_service_model_holder import PvProductionServiceModelHolder
from ai.model_holder.setpoint_optimizer_model_holder import SetpointOptimizerModelHolder
from ai.model_holder.stream_anomaly_detection_model_holder import StreamAnomalyDetectionModelHolder
from ai.utils.iterable_utils import batch
from ai.utils.logging_utils import configure_worker_logging
from ai.weather.weather_holder import WeatherHolder


@dataclasses.dataclass(order=True, frozen=True, kw_only=True)
class ProcessInfo:
    total_used_memory_in_gb: float
    process_creation_time: datetime.datetime


@dataclasses.dataclass(order=True, frozen=True, kw_only=True)
class MemoryInfo:
    total_available_memory_in_gb: float
    total_used_memory_in_gb: float
    total_memory_utilization: float
    root_process_id: int
    process_info_per_pid: dict[int, ProcessInfo]


class Priority(enum.Enum):
    CRITICAL = 0
    HIGH = 1
    MEDIUM = 2
    LOW = 3


@dataclasses.dataclass
class JobMessage:
    name: str
    model_id: str
    holder_type: str
    job_id: str


def get_address() -> tuple[str, int]:
    """return the host of the manager server"""

    return '127.0.0.1', 54321


def get_default_manager_class() -> typing.Type[multiprocessing.managers.BaseManager]:
    """return the default manager class"""

    return multiprocessing.managers.SyncManager


def register_custom_classes(manager_class: typing.Type[multiprocessing.managers.BaseManager]) -> None:
    """register the custom proxy objects that should be createable via the manager"""

    manager_class.register(
        'dict', dict, multiprocessing.managers.DictProxy)
    manager_class.register(
        'WeatherHolder', WeatherHolder)
    manager_class.register(
        'ConsumptionServiceModelHolder', ConsumptionServiceModelHolder)
    manager_class.register(
        'EmsModelHolder', EmsModelHolder)
    manager_class.register(
        'HistoryAnomalyDetectionModelHolder', HistoryAnomalyDetectionModelHolder)
    manager_class.register(
        'PvMonitoringServiceModelHolder', PvMonitoringServiceModelHolder)
    manager_class.register(
        'PvProductionServiceModelHolder', PvProductionServiceModelHolder)
    manager_class.register(
        'SetpointOptimizerModelHolder', SetpointOptimizerModelHolder)
    manager_class.register(
        'StreamAnomalyDetectionModelHolder', StreamAnomalyDetectionModelHolder)


def start_manager_server(manager_class: typing.Type[multiprocessing.managers.BaseManager]) -> None:
    """start manager server"""

    register_custom_classes(manager_class)
    manager = manager_class(address=get_address())
    server = manager.get_server()
    server.serve_forever()


def init_manager(
        manager_class: typing.Type[multiprocessing.managers.BaseManager] = get_default_manager_class()) -> None:
    """start manager server in a process"""

    start_process(target=start_manager_server, args=(manager_class,))
    time.sleep(10)


class Manager:
    """manager factory class used to get a manager for object sharing"""

    manager: multiprocessing.managers.BaseManager | None = None

    @staticmethod
    def get(manager_class: typing.Type[multiprocessing.managers.BaseManager] = get_default_manager_class()) -> \
            multiprocessing.managers.BaseManager:
        """returns the manager object"""

        if Manager.manager is None:
            register_custom_classes(manager_class)
            manager = manager_class(address=get_address())
            manager.connect()
            Manager.manager = manager
        return Manager.manager


def create_weather_holder_proxy_object(weather_holder: WeatherHolder) -> WeatherHolder:
    """create a shareable proxy object"""

    return Manager.get().WeatherHolder(
        project_id=weather_holder.get_project_id(), site_id=weather_holder.get_site_id(),
        project_longitude=weather_holder.get_project_longitude(),
        project_latitude=weather_holder.get_project_latitude(),
        site_longitude=weather_holder.get_site_longitude(), site_latitude=weather_holder.get_site_latitude(),
        username=weather_holder.get_username(), password=weather_holder.get_password())


def create_model_holder_proxy_object(model_holder: ModelHolder) -> ModelHolder:
    """create a shareable proxy object"""

    return getattr(Manager.get(), model_holder.__class__.__name__)(
        dh=model_holder.get_dh(), model=model_holder.get_model(), status=model_holder.get_status())


def start_process(target: collections.abc.Callable, args: tuple[object, ...] = ()) -> multiprocessing.Process:
    """start a process with the passed arguments"""

    process = multiprocessing.Process(target=target, args=args)
    process.start()
    return process


def wait_until_total_memory_utilization_is_below_threshold(
        main_process_pid: int, priority: Priority, threshold: float = 0.9, wait_interval_seconds: int = 1) -> None:
    """wait until total_memory_utilization is below the threshold"""

    if priority == Priority.CRITICAL:
        return
    while (total_memory_utilization := get_current_memory_info(main_process_pid).total_memory_utilization) >= threshold:
        logging.info(f'waiting to start job as the memory utilization of {total_memory_utilization} '
                     f'was larger than the threshold of {threshold} ...', )
        time.sleep(wait_interval_seconds)


def get_current_memory_info(main_process_pid: int) -> MemoryInfo:
    """returns the current memory usage of the whole python process tree"""

    # initialize the main process
    main_process = psutil.Process(main_process_pid)

    # get the child processes
    child_processes = main_process.children(recursive=True)

    # get the available gigabytes of memory
    total_available_memory_in_gb = convert_bytes_to_gb(
        psutil.virtual_memory().total)

    # compute the process info for each process
    process_info_per_pid: dict[int, ProcessInfo] = {}
    for process in [main_process, *child_processes]:
        try:
            process_info_per_pid[process.pid] = ProcessInfo(
                total_used_memory_in_gb=convert_bytes_to_gb(
                    process.memory_info().rss),
                process_creation_time=datetime.datetime.utcfromtimestamp(process.create_time()))
        except psutil.NoSuchProcess:
            continue

    # compute the total used memory
    total_used_memory_in_gb = sum(
        map(lambda x: x.total_used_memory_in_gb, process_info_per_pid.values()))

    # compute the memory utilization
    total_memory_utilization = total_used_memory_in_gb / total_available_memory_in_gb

    return MemoryInfo(
        total_available_memory_in_gb=total_available_memory_in_gb,
        total_used_memory_in_gb=total_used_memory_in_gb,
        total_memory_utilization=total_memory_utilization,
        root_process_id=main_process.pid,
        process_info_per_pid=process_info_per_pid)


def convert_bytes_to_gb(value: int) -> float:
    """convert bytes to gigabytes"""

    return value / (1024 ** 3)


def initialize_worker(logging_queue: multiprocessing.Queue, log_level: int) -> None:
    """configure the correct logger handler for the root logger"""

    root_logger = logging.getLogger()
    configure_worker_logging(root_logger, logging_queue, log_level)
    root_logger.debug(f'starting worker with pid {os.getpid()}')


def get_executor_class(process_based: bool) -> typing.Type[concurrent.futures.ThreadPoolExecutor |
                                                           concurrent.futures.ProcessPoolExecutor]:
    """ Retrieve the correct executor class to create a worker pool, 
    either Process Pool Executor or Thread Pool Executor (if process_based is false).

    :param process_based: Set to true if the executor class should be ProcessPoolExecutor
    :type process_based: bool
    :return: Class to execute in. 
    :rtype: typing.Type[concurrent.futures.ThreadPoolExecutor | concurrent.futures.ProcessPoolExecutor]
    """

    if process_based:
        return concurrent.futures.ProcessPoolExecutor
    else:
        return concurrent.futures.ThreadPoolExecutor


def get_executor_options(process_based: bool, queue: multiprocessing.Queue,
                         log_level: int, workers: int) -> dict[str, object]:
    """_summary_

    :param process_based: _description_
    :type process_based: bool
    :param queue: _description_
    :type queue: multiprocessing.Queue
    :param log_level: _description_
    :type log_level: int
    :param workers: _description_
    :type workers: int
    :return: _description_
    :rtype: dict[str, object]
    """

    if process_based:
        return {'max_workers': workers, 'initializer': initialize_worker,
                'initargs': (queue, log_level), 'max_tasks_per_child': 1}
    else:
        return {'max_workers': workers}


def wait_for_all_futures_to_be_done(futures: list[concurrent.futures.Future]) -> None:
    """wait for all futures to be either finished, cancelled or have raised an exception"""

    for single_future_list in batch(futures, batch_size=1):
        concurrent.futures.wait(
            single_future_list, return_when=concurrent.futures.FIRST_EXCEPTION)


def execute_submit_args_list_in_processes(
        executor_pool: deadpool.Deadpool,
        priority: Priority,
        timeout: float | None,
        submit_args_list: list,
        global_state: multiprocessing.managers.Namespace) -> None:
    """execute the submit args list in processes in the passed pool and wait for completion"""

    futures = []
    for submit_args in submit_args_list:
        wait_until_total_memory_utilization_is_below_threshold(
            global_state.main_process_pid, priority)
        logging.info(
            f'adding job {submit_args[0].__name__} for holder {submit_args[1]} of type {submit_args[2].__name__}')
        future = executor_pool.submit(*submit_args,
                                      deadpool_priority=priority.value,
                                      deadpool_timeout=timeout)
        futures.append(future)
    wait_for_all_futures_to_be_done(futures)


def execute_submit_args_list_in_thread_pool(
        priority: Priority,
        submit_args_list: list,
        global_state: multiprocessing.managers.Namespace,
        workers: int):
    """execute the passed submit args list in a thread pool executor"""

    futures = []
    with get_executor_class(False)(
            **get_executor_options(False, global_state.logging_queue, global_state.log_level, workers)) as executor:
        for submit_args in submit_args_list:
            wait_until_total_memory_utilization_is_below_threshold(
                global_state.main_process_pid, priority)
            logging.info(
                f'adding job {submit_args[0].__name__} for holder {submit_args[1]} of type {submit_args[2].__name__}')
            future = executor.submit(*submit_args)
            futures.append(future)
    wait_for_all_futures_to_be_done(futures)


def execute_submit_args_list_in_threads(
        executor_pool: deadpool.Deadpool,
        priority: Priority,
        timeout: float | None,
        submit_args_list: list,
        global_state: multiprocessing.managers.Namespace,
        threads_per_process: int = 16) -> None:
    """execute the submit args list in threads spawned in a process inside the passed pool and wait for completion"""

    futures = []
    for submit_args_list_batch in batch(submit_args_list, threads_per_process):
        future = executor_pool.submit(execute_submit_args_list_in_thread_pool,
                                      priority, submit_args_list_batch, global_state, len(
                                          submit_args_list_batch),
                                      deadpool_priority=priority.value,
                                      deadpool_timeout=timeout)
        futures.append(future)
    wait_for_all_futures_to_be_done(futures)


def start_job(target: collections.abc.Callable,
              holders: dict[str, typing.Type[ModelHolder | WeatherHolder]],
              holder_type: typing.Type[ModelHolder | WeatherHolder] | tuple[
                  typing.Type[ModelHolder | WeatherHolder], ...],
              priority: Priority,
              process: bool,
              executor_pool: deadpool.Deadpool,
              global_state: multiprocessing.managers.Namespace,
              timeout: float | None = None,
              additional_params: tuple[object] = (),
              callback_func: collections.abc.Callable = None,
              callback_args: tuple[object] = ()) -> None:
    """starts a job using holders in a separate job with a logging queue"""

    logging.info("start jobs with target %s", target.__name__)
    submit_args_list = []
    try:
        # build the arguments for the jobs
        for identifier, holder_class in holders.items():
            if issubclass(holder_class, holder_type):
                submit_args_list.append(
                    (target, identifier, holder_class, *additional_params))
        if process:
            execute_submit_args_list_in_processes(
                executor_pool, priority, timeout, submit_args_list, global_state)
        else:
            execute_submit_args_list_in_threads(
                executor_pool, priority, timeout, submit_args_list, global_state)
    except Exception as e:
        logging.exception(e)
    finally:
        logging.info("end start job thread with target %s", target.__name__)
        if callback_func is not None:
            logging.debug('running callback function')
            callback_func(*callback_args)


def start_job_in_executor(target: collections.abc.Callable,
                          executor_pool: concurrent.futures.Executor,
                          holders: dict[str, typing.Type[ModelHolder | WeatherHolder]],
                          holder_type: typing.Type[ModelHolder | WeatherHolder] | tuple[typing.Type[ModelHolder | WeatherHolder], ...],
                          additional_params: tuple[object] = (),
                          callback_func: collections.abc.Callable = None,
                          callback_args: tuple[object] = ()) -> None:
    """Start target for all entries in holders of type holder_type in a given executor. 

    :param target: Function to run
    :type target: collections.abc.Callable
    :param executor_pool: Executor pool to run functions in
    :type executor_pool: concurrent.futures.Executor
    :param holders: Holders get looped through and for all models of type holder_type the function gets submitted to pool
    :type holders: dict[str, typing.Type[ModelHolder  |  WeatherHolder]]
    :param holder_type: Type for which the function should be executed
    :type holder_type: typing.Type[ModelHolder  |  WeatherHolder] | tuple[typing.Type[ModelHolder  |  WeatherHolder], ...]
    :param additional_params: Additional parameters for function target, defaults to ()
    :type additional_params: tuple[object], optional
    :param callback_func: Callback to run after all targets ran, defaults to None
    :type callback_func: collections.abc.Callable, optional
    :param callback_args: Arguments to pass to callback, defaults to ()
    :type callback_args: tuple[object], optional
    """

    logging.info("start jobs with target %s", target.__name__)
    submit_args_list = []
    try:
        # build the arguments for the jobs
        for identifier, holder_class in holders.items():
            if issubclass(holder_class, holder_type):
                submit_args_list.append(
                    (target, identifier, holder_class, *additional_params))
        futures = []
        for submit_args in submit_args_list:
            logging.info("adding job %s for holder %s of type %s",
                         submit_args[0].__name__, submit_args[1], submit_args[2].__name__)
            future = executor_pool.submit(*submit_args)
            futures.append(future)
        wait_for_all_futures_to_be_done(futures)
    except Exception as e:
        logging.exception(e)
    finally:
        logging.info("end start job thread with target %s", target.__name__)
        if callback_func is not None:
            logging.debug(
                "running callback function for job %s", target.__name__)
            callback_func(*callback_args)


def publish_job_to_message_queue(job: collections.abc.Callable, holders: dict[str, typing.Type[ModelHolder | WeatherHolder]],
                                 holder_type: typing.Type[ModelHolder | WeatherHolder], running_jobs: dict[str, float], queue='task_queue') -> None:
    """ Publish a job for worker nodes to RabbitMQ task queue

    :param job: Job that should be executed. Currently it is the same function as used in the init utisl
    :type job: collections.abc.Callable
    :param holders: All model holders for which the job should be executed. For each model in holders a task gets published
    :type holders: dict[str, typing.Type[ModelHolder  |  WeatherHolder]]
    :param holder_type: Type of models for which the jobs should be executed, if an entry of holders is of different type a job for it will not be scheduled
    :type holder_type: typing.Type[ModelHolder | WeatherHolder]
    """

    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='rabbit-mq'))

        channel = connection.channel()

        channel.queue_declare(queue=queue, durable=True)
        for identifier, holder_class in holders.items():

            job_id = f"{job.__name__}:{identifier}"
            job_in_list = job_id in running_jobs.keys()
            if job_in_list:
                logging.info(
                    "Job %s for holder already in list %s", job_id, running_jobs.keys())
            if issubclass(holder_class, holder_type) and not job_in_list:
                payload = JobMessage(
                    name=job.__name__,
                    model_id=identifier,
                    holder_type=holder_class.__name__,
                    job_id=job_id)

                message = json.dumps(payload.__dict__)

                channel.basic_publish(
                    exchange='',
                    routing_key=queue,
                    body=message,
                    properties=pika.BasicProperties(
                        delivery_mode=pika.DeliveryMode.Persistent
                    ))
                running_jobs[job_id] = time.time()
                logging.info("Publish to '%s' %s", queue, message)
        connection.close()
    except Exception as e:
        logging.exception(e)


def purge_job_queue():
    try:
        connection = pika.BlockingConnection(
            pika.ConnectionParameters(host='rabbit-mq'))
        channel = connection.channel()

        channel.queue_declare(queue='task_queue', durable=True)
        channel.queue_purge(queue='task_queue')
        connection.close()
    except Exception as e:
        logging.exception(e)


def alternate_heartbeat(global_state: multiprocessing.managers.Namespace) -> None:
    """alternates the heartbeat on the global state"""

    logging.debug("alternating heartbeat")
    global_state.heartbeat = not global_state.heartbeat
    global_state.metrics_timestamps["heartbeat_thread"] = time.time()
