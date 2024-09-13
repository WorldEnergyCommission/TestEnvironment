import argparse
import collections.abc
import functools
import logging
import logging.handlers
import multiprocessing
import os
import time
import typing
import warnings

import optuna
from prometheus_client import CollectorRegistry, multiprocess, generate_latest
import sanic
import sanic.exceptions
import sanic.response
import sanic.worker.loader
import sanic_cors
import urllib3.exceptions

from ai.execution.handlers import (calculate_autarchy_handler, change_handler, change_spo_parameters_handler,
                                   create_handler, create_site_handler,
                                   delete_handler, delete_site_handler, favorites_handler, get_handler, get_report_handler, get_score_handler,
                                   get_site_handler, list_handler,
                                   list_site_handler, settings_handler)
from ai.execution.threads import logging_listener_thread, train_model_queue_listener_thread
from ai.interface.model_holder import ModelHolder
from ai.utils.init_utils import init_all_model_holders, init_all_weather_sites, get_percentage_of_total, get_scheduler, init_metrics_timestamp_dict
from ai.utils.logging_utils import configure_worker_logging
from ai.utils.multiprocessing_utils import init_manager, Manager
from ai.utils.prometheus_utils import (generate_elapsed_metrics_from_dict, observe_memory_gauge_metrics_for_process,
                                       observe_job_histogram_metric, observe_running_jobs_gauge_metrics)
from ai.weather.weather_holder import WeatherHolder


def parse_args() -> argparse.Namespace:
    """return the cli arguments as namespace object"""

    parser = argparse.ArgumentParser(description="ai")
    parser.add_argument("--log_file_path", type=str, default=None)
    args = parser.parse_args()
    return args


def manage_handler(
        func: collections.abc.Callable[..., object]) -> collections.abc.Callable[..., sanic.HTTPResponse]:
    """decorator that catches exceptions and returns a proper response object"""

    def wrap(*args: object, **kwargs: object) -> sanic.HTTPResponse:
        try:
            return sanic.response.json(func(*args, **kwargs))
        except KeyError as e:
            raise sanic.exceptions.BadRequest(repr(e))
        except Exception as e:
            raise sanic.exceptions.ServerError(repr(e))

    return wrap


def create_app(
        model_holders: dict[str, typing.Type[ModelHolder]],
        weather_sites: dict[str, typing.Type[WeatherHolder]],
        project_mappings: dict[str, str],
        train_model_queue: multiprocessing.Queue,
        main_process_pid: int,
        metrics_timestamps: dict[str, float],
        running_jobs: dict[str, float]):
    """create the sanic application"""

    app = sanic.Sanic("ai")

    # createAI (project_right)
    @app.route("/controllers", methods=["POST"])
    async def create_controller(request: sanic.Request) -> sanic.HTTPResponse:
        """endpoint that handles the creation of a new model"""

        return manage_handler(create_handler)(
            r=request.json, weather_sites=weather_sites,
            model_holders=model_holders, project_mappings=project_mappings,
            train_model_queue=train_model_queue)

    # only internal usage
    @app.route("/controllers", methods=["GET"])
    async def get_controllers(_: sanic.Request) -> sanic.HTTPResponse:
        """endpoint that is used as a data interface for the model"""

        return manage_handler(list_handler)(model_holders=model_holders, project_mappings=project_mappings)

    # listAI (project_right)
    @app.route("/controllers/<project_id:str>", methods=["GET"])
    async def get_controllers_from_project(_: sanic.Request, project_id: str) -> sanic.HTTPResponse:
        """endpoint that lists every model of a project"""

        return manage_handler(list_handler)(model_holders=model_holders,
                                            project_mappings=project_mappings, project=project_id)

    # readAI * (project_right)
    @app.route("/autarchy/<project_id:str>/<start:int>/<end:int>", methods=["GET"])
    async def get_autarchy_score(request: sanic.Request, project_id: str, start: int, end: int) -> sanic.HTTPResponse:
        """endpoint that computes the autarchy score"""

        return manage_handler(calculate_autarchy_handler)(request.args, project_id, start, end)

    @app.route("/<model_id:str>", methods=["GET"])
    async def get_controller_status(_: sanic.Request, model_id: str) -> sanic.HTTPResponse:
        """endpoint that handles the data interface to a single model"""

        return manage_handler(get_handler)(
            model_id=model_id, model_holders=model_holders)

    @app.route("/controllers/<model_id:str>", methods=["PUT"])
    async def change_controller(request: sanic.Request, model_id: str) -> sanic.HTTPResponse:
        """endpoint to change a model, this endpoint also retrains the model"""

        return manage_handler(change_handler)(
            r=request.json, model_id=model_id, weather_sites=weather_sites,
            model_holders=model_holders, project_mappings=project_mappings,
            train_model_queue=train_model_queue)

    @app.route("/controllers/<model_id:str>/favorites", methods=["PUT"])
    async def set_favorites(_: sanic.Request, model_id: str) -> sanic.HTTPResponse:
        """endpoint that sets the favorite flag of a model to true"""

        return manage_handler(favorites_handler)(
            model_id=model_id, favorite=True, model_holders=model_holders)

    @app.route("/controllers/<model_id:str>/favorites", methods=["DELETE"])
    async def delete_favorites(_: sanic.Request, model_id: str) -> sanic.HTTPResponse:
        """endpoint that sets the favorite flag of a model to false"""

        return manage_handler(favorites_handler)(
            model_id=model_id, favorite=False, model_holders=model_holders)

    @app.route("/controllers/<model_id:str>", methods=["DELETE"])
    async def delete_controller(_: sanic.Request, model_id: str) -> sanic.HTTPResponse:
        """endpoint that handles the delete process of a model"""

        return manage_handler(delete_handler)(
            model_id=model_id, model_holders=model_holders, project_mappings=project_mappings)

    @app.route("/controllers/<model_id:str>/settings", methods=["PUT"])
    async def change_settings(request: sanic.Request, model_id: str) -> sanic.HTTPResponse:
        """endpoint to change the settings of a model that does not require retraining"""

        return manage_handler(settings_handler)(
            request.json["settings"], model_id=model_id, model_holders=model_holders)

    @app.route("/weather/<project_id:str>", methods=["POST"])
    async def create_site(request: sanic.Request, project_id: str) -> sanic.HTTPResponse:
        """endpoint to create a new weather site"""

        return manage_handler(create_site_handler)(
            request.json, project=project_id, weather_sites=weather_sites)

    @app.route("weather/<project_id:str>", methods=["GET"])
    async def get_weather_site(_: sanic.Request, project_id: str) -> sanic.HTTPResponse:
        """get a specific weather site"""

        return manage_handler(get_site_handler)(
            project=project_id, weather_sites=weather_sites)

    @app.route("weather", methods=["GET"])
    async def list_weather(_: sanic.Request) -> sanic.HTTPResponse:
        """list all weather sites"""

        return manage_handler(list_site_handler)(weather_sites=weather_sites)

    @app.route("weather/<project_id:str>", methods=["DELETE"])
    async def delete_weather_site(_: sanic.Request, project_id: str) -> sanic.HTTPResponse:
        """delete a weather site"""

        return manage_handler(delete_site_handler)(
            project=project_id, weather_sites=weather_sites)

    @app.route("/controllers/<model_id:str>/parameters", methods=["PUT"])
    async def change_spo_parameters(request: sanic.Request, model_id: str) -> sanic.HTTPResponse:
        """endpoint to change the setpoint optimizer parameters"""

        return manage_handler(change_spo_parameters_handler)(
            request.json["curve_params"], model_id=model_id, model_holders=model_holders)

    @app.route("/controllers/<model_id:str>/score", methods=["GET"])
    async def get_score(request: sanic.Request, model_id: str) -> sanic.HTTPResponse:
        """endpoint to get the a score, e.g.: the loadmonitor compliance score"""

        return manage_handler(get_score_handler)(
            model_id=model_id, start=request.json["start"], end=request.json["end"], model_holders=model_holders)

    @app.route("/controllers/<model_id:str>/report", methods=["GET"])
    async def get_report(request: sanic.Request, model_id: str) -> sanic.HTTPResponse:
        """endpoint to get the a report, e.g.: the loadmonitor report"""

        start = request.args.get("start")
        if not start:
            raise sanic.exceptions.BadRequest("No start provided")
        end = request.args.get("end")
        if not end:
            raise sanic.exceptions.BadRequest("No end provided")

        return manage_handler(get_report_handler)(
            model_id=model_id,
            start=int(start),
            end=int(end),
            model_holders=model_holders)

    @app.route("/metrics", methods=["GET"])
    async def metrics(request: sanic.Request) -> sanic.HTTPResponse:
        """ endpoint for prometheus metrics """
        try:

            observe_memory_gauge_metrics_for_process(
                main_process_pid)

            generate_elapsed_metrics_from_dict(
                metrics_timestamps)

            observe_running_jobs_gauge_metrics(len(running_jobs))

            registry = CollectorRegistry()
            multiprocess.MultiProcessCollector(registry)
            data = generate_latest(registry)

            return sanic.response.text(str(data, "utf-8"))
        except KeyError as e:
            raise sanic.exceptions.BadRequest(repr(e))
        except Exception as e:
            raise sanic.exceptions.ServerError(repr(e))

    @app.route("/callback", methods=["POST"])
    async def job_callback(request: sanic.Request) -> sanic.HTTPResponse:
        """ endpoint for prometheus metrics """
        try:
            j = request.json["job_id"]
            job_name = j.split(":")[0]
            model_id = j.split(":")[1]
            duration = time.time() - running_jobs[j]
            observe_job_histogram_metric(
                job_name=job_name, model_id=model_id, job_duration=duration)
            del running_jobs[j]
            return sanic.response.empty()
        except KeyError as e:
            raise sanic.exceptions.BadRequest(repr(e))
        except Exception as e:
            raise sanic.exceptions.ServerError(repr(e))

    sanic_cors.CORS(app)

    return app


def main() -> None:
    # set multiprocessing to spawn because forked processes hang sometimes
    multiprocessing.set_start_method(method='spawn', force=False)
    # notify sanic that start method was set externally
    sanic.Sanic.START_METHOD_SET = True

    # get main process pid
    main_process_pid = os.getpid()

    # set default log level
    log_level = os.environ.get('LOGLEVEL', logging.INFO)

    # log the application start
    logging.info("starting ai server ...")

    # get the arguments
    args = parse_args()
    # start the sync manager process for sharing data between threads and processes
    init_manager()

    # multiprocessing requires centralized logging
    logging_queue = Manager.get().Queue(-1)
    log_listener_process = multiprocessing.Process(
        target=logging_listener_thread, args=(logging_queue, args.log_file_path, log_level))
    log_listener_process.start()

    # initialize a model train queue
    train_model_queue = Manager.get().Queue(-1)
    train_model_queue_process = multiprocessing.Process(
        target=train_model_queue_listener_thread, args=(train_model_queue,))
    train_model_queue_process.start()

    # dict for metrics timestamps
    metrics_timestamps = init_metrics_timestamp_dict()

    # configure logging for main process
    configure_worker_logging(logging.getLogger(), logging_queue, log_level)

    # create a global state object and initialize the heartbeat
    global_state = Manager.get().Namespace()
    global_state.heartbeat = False
    global_state.main_process_pid = main_process_pid
    global_state.log_level = log_level
    global_state.logging_queue = logging_queue
    global_state.metrics_timestamps = metrics_timestamps
    global_state.running_jobs = Manager.get().dict()

    # disable experimental warnings for optuna and warnings for http requests
    warnings.filterwarnings(
        "ignore", category=optuna.exceptions.ExperimentalWarning)
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

    # initialize weather sites, model holders, states and threads
    weather_sites = init_all_weather_sites()
    model_holders, project_mappings = init_all_model_holders()

    # start the scheduler
    scheduler = get_scheduler(weather_sites, model_holders, global_state,
                              log_memory=True, process_worker_multiplier=1)
    scheduler.start()

    # create the sanic app
    loader = sanic.worker.loader.AppLoader(
        factory=functools.partial(create_app, model_holders, weather_sites,
                                  project_mappings, train_model_queue, main_process_pid,
                                  metrics_timestamps, global_state.running_jobs))
    app = loader.load()

    # start the sanic server
    app.prepare(
        host="0.0.0.0",
        port=8000,
        workers=get_percentage_of_total(0.5, multiprocessing.cpu_count()))
    sanic.Sanic.serve(primary=app, app_loader=loader)

    # call clean up methods and wait for termination
    logging_queue.put_nowait(None)
    log_listener_process.join()
    scheduler.shutdown()


if __name__ == "__main__":
    main()
