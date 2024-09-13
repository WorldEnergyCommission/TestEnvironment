import logging
import time
from prometheus_client import Gauge, Histogram

from ai.utils.multiprocessing_utils import get_current_memory_info


MPC_MEMORY_USAGE_GAUGE = Gauge(
    name="mpc_memory_usage", documentation="Used Memory in %",
    labelnames=["process_id"])


def observe_memory_gauge_metrics_for_process(process_id: int):
    """ return observe prometheus metrics for currently used memory

        :param process_id: id of the process
    """

    meminfo = get_current_memory_info(process_id)
    MPC_MEMORY_USAGE_GAUGE.labels(process_id).set(
        meminfo.total_memory_utilization)


MPC_RUNNING_JOBS_GAUGE = Gauge(
    name="mpc_running_jobs", documentation="Number of running jobs")


def observe_running_jobs_gauge_metrics(running_jobs: int):
    """ return observe prometheus metrics for number of running jobs

        :param running_jobs: number of running jobs
    """
    MPC_RUNNING_JOBS_GAUGE.set(running_jobs)


MPC_HEARTBEAT_ELAPSED_GAUGE = Gauge(
    "mpc_heartbeat_elapsed", "Seconds elapsed since last heartbeat job run")
MPC_LOGWEATHER_ELAPSED_GAUGE = Gauge(
    "mpc_logweather_elapsed", "Seconds elapsed since last log-weather job run")


def generate_elapsed_metrics_from_dict(dic: dict[str, float]):
    """
    Calculates the elapsed time for heartbeat and logweather threads and updates the corresponding Prometheus gauges.

    Args:
        dic (dict[str, float]): A dictionary containing the timestamps of the heartbeat and logweather threads.

    Returns:
        None
    """
    heartbeat_duration = time.time() - dic["heartbeat_thread"]
    logweather_thread = time.time() - dic["logweather_thread"]

    MPC_HEARTBEAT_ELAPSED_GAUGE.set(heartbeat_duration)
    MPC_LOGWEATHER_ELAPSED_GAUGE.set(logweather_thread)

    return


# Metrics for all jobs running in worker containers
# These metrics are used to monitor the duration of the jobs

# Buckets for the histogram (seconds)
JOB_HISTOGRAM_BUCKETS = [0.5, 1, 2, 5, 10, 30, 60,
                        90, 120, 300, 600, 1800, 3600, float("inf")]

TRAIN_MODEL_THREAD_HISTOGRAM = Histogram(
    name="mpc_train_model_thread",
    documentation="Duration of train model thread in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)
CONSUMPTION_SERVICE_PREDICTION_HISTOGRAM = Histogram(
    name="mpc_consumption_service_prediction",
    documentation="Duration of consumption service prediction in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)
HISTORY_ANOMALY_DETECTION_PREDICTION_HISTOGRAM = Histogram(
    name="mpc_history_anomaly_detection_prediction",
    documentation="Duration of history anomaly detection prediction in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)
STREAM_ANOMALY_DETECTION_PREDICTION_HISTOGRAM = Histogram(
    name="mpc_stream_anomaly_detection_prediction",
    documentation="Duration of stream anomaly detection prediction in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)
PV_MONITORING_SERVICE_PREDICTION_HISTOGRAM = Histogram(
    name="mpc_pv_monitoring_service_prediction",
    documentation="Duration of pv monitoring service prediction in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)
PV_PRODUCTION_SERVICE_PREDICTION_HISTOGRAM = Histogram(
    name="mpc_pv_production_service_prediction",
    documentation="Duration of pv production service prediction in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)
LOAD_MONITOR_PREDICTION_HISTOGRAM = Histogram(
    name="mpc_load_monitor_prediction",
    documentation="Duration of load monitor prediction in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)
SETPOINT_OPTIMIZER_PREDICTION_HISTOGRAM = Histogram(
    name="mpc_setpoint_optimizer_prediction",
    documentation="Duration of setpoint optimizer prediction in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)
TRAIN_MODEL_DAILY_HISTOGRAM = Histogram(
    name="mpc_train_model_daily", documentation="Duration of train model daily in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)
EMS_PREDICTION_HISTOGRAM = Histogram(
    name="mpc_ems_prediction", documentation="Duration of ems prediction in seconds",
    labelnames=["model_id"],
    buckets=JOB_HISTOGRAM_BUCKETS)


def observe_job_histogram_metric(job_name: str, model_id: str, job_duration: float):
    """
    Registers a job summary metric for a specific model and job.

    Args:
        job_name (str): The name of the job.
        model_id (str): The ID of the model.
        job_duration (float): The duration of the job in seconds.
    """
    match job_name:
        case "train_model_thread":
            TRAIN_MODEL_THREAD_HISTOGRAM.labels(model_id).observe(job_duration)
        case "train_model_daily_thread":
            TRAIN_MODEL_DAILY_HISTOGRAM.labels(model_id).observe(job_duration)
        case "ems_prediction_thread":
            EMS_PREDICTION_HISTOGRAM.labels(model_id).observe(job_duration)
        case "setpoint_optimizer_prediction_thread":
            SETPOINT_OPTIMIZER_PREDICTION_HISTOGRAM.labels(
                model_id).observe(job_duration)
        case "consumption_service_prediction_thread":
            CONSUMPTION_SERVICE_PREDICTION_HISTOGRAM.labels(
                model_id).observe(job_duration)
        case "history_anomaly_detection_prediction_thread":
            HISTORY_ANOMALY_DETECTION_PREDICTION_HISTOGRAM.labels(
                model_id).observe(job_duration)
        case "stream_anomaly_detection_prediction_thread":
            STREAM_ANOMALY_DETECTION_PREDICTION_HISTOGRAM.labels(
                model_id).observe(job_duration)
        case "pv_monitoring_service_prediction_thread":
            PV_MONITORING_SERVICE_PREDICTION_HISTOGRAM.labels(
                model_id).observe(job_duration)
        case "pv_production_service_prediction_thread":
            PV_PRODUCTION_SERVICE_PREDICTION_HISTOGRAM.labels(
                model_id).observe(job_duration)
        case "load_monitor_prediction_thread":
            LOAD_MONITOR_PREDICTION_HISTOGRAM.labels(
                model_id).observe(job_duration)
        case _:
            logging.info(f"no prometheus metric for job: {job_name}")
