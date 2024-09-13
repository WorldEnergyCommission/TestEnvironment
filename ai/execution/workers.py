import json
import logging
import multiprocessing
import os
import signal
import sys
import pika

from ai.execution.threads import activate_heating_pumps_for_ems_thread, consumption_service_prediction_thread, \
    ems_prediction_thread, heartbeat_thread, history_anomaly_detection_prediction_thread, log_weather_thread, \
    pv_monitoring_service_prediction_thread, pv_production_service_prediction_thread, report_memory_usage_thread, \
    setpoint_optimizer_prediction_thread, stream_anomaly_detection_prediction_thread, train_model_daily_thread, \
    train_model_thread, load_monitor_prediction_thread

from ai.interface.model_holder import ModelHolder
from ai.model_holder.consumption_service_model_holder import ConsumptionServiceModelHolder
from ai.model_holder.ems_model_holder import EmsModelHolder
from ai.model_holder.history_anomaly_detection_model_holder import HistoryAnomalyDetectionModelHolder
from ai.model_holder.pv_monitoring_service_model_holder import PvMonitoringServiceModelHolder
from ai.model_holder.pv_production_service_model_holder import PvProductionServiceModelHolder
from ai.model_holder.setpoint_optimizer_model_holder import SetpointOptimizerModelHolder
from ai.model_holder.stream_anomaly_detection_model_holder import StreamAnomalyDetectionModelHolder
from ai.model_holder.load_monitor_model_holder import LoadMonitorModelHolder
from ai.utils.logging_utils import DATEFORMAT, FORMAT
from ai.utils.request_utils import HIGH_TIMEOUT_SECONDS, RequestSession
from ai.utils.http_utils import get_json_response, get_mpc_url

WORK_PROCESS: multiprocessing.Process = None
CONN: pika.BlockingConnection = None


def holder_type_from_name(name: str) -> ModelHolder:
    match name:
        case "EmsModelHolder":
            return EmsModelHolder
        case "PvProductionServiceModelHolder":
            return PvProductionServiceModelHolder
        case "PvMonitoringServiceModelHolder":
            return PvMonitoringServiceModelHolder
        case "ConsumptionServiceModelHolder":
            return ConsumptionServiceModelHolder
        case "SetpointOptimizerModelHolder":
            return SetpointOptimizerModelHolder
        case "HistoryAnomalyDetectionModelHolder":
            return HistoryAnomalyDetectionModelHolder
        case "StreamAnomalyDetectionModelHolder":
            return StreamAnomalyDetectionModelHolder
        case "LoadMonitorModelHolder":
            return LoadMonitorModelHolder
    return ModelHolder


def on_message_callback(ch, method, properties, body):
    """Callback for Job in Message Queue.
    Runs the job in it's own process in order for the main thread to not be blocked.
    This allows Pika to send heartbeats.
    After the job finishes the message gets acknowleged.


    :param ch: Channel to ack message
    :type ch: _type_
    :param method: _description_
    :type method: _type_
    :param properties: _description_
    :type properties: _type_
    :param body: _description_
    :type body: _type_
    """
    global WORK_PROCESS

    logging.info("Received message with body: %s", body.decode())
    res = json.loads(body.decode())
    job_name = res["name"]
    model_id = res["model_id"]
    job_id = res["job_id"]
    holder_type = holder_type_from_name(res["holder_type"])
    kwargs = {"model_id": model_id, "_": holder_type}

    def callback(error: str = None):
        ch.basic_ack(delivery_tag=method.delivery_tag)
        if error is None:
            logging.info("Finished Job %s, for model %s", job_name, model_id)
        else:
            logging.error(error)

        try:
            r = RequestSession.get_session().post(url=(get_mpc_url() + "/callback"),
                                                  timeout=HIGH_TIMEOUT_SECONDS,
                                                  json={"job_id": job_id})
            if not r.ok:
                raise Exception(f"Failed to send callback for job \
                                {job_id}. Repsonse-status: {r.status_code} Response-text:{r.text}")
        except Exception as e:
            logging.exception(e)

    def process_job(job, callback, **kwargs):
        # Simulate some processing time
        try:
            job(**kwargs)
        except Exception as e:
            logging.exception(e)
        finally:
            callback()

    logging.info("Starting job: %s", job_name)
    match job_name:
        case "train_model_thread":
            job = train_model_thread
            kwargs = {"model_id": model_id, "model_holder_type": holder_type}
        case "train_model_daily_thread":
            job = train_model_daily_thread
            kwargs = {"model_id": model_id, "model_holder_type": holder_type}
        case "ems_prediction_thread":
            job = ems_prediction_thread
        case "setpoint_optimizer_prediction_thread":
            job = setpoint_optimizer_prediction_thread
        case "consumption_service_prediction_thread":
            job = consumption_service_prediction_thread
        case "history_anomaly_detection_prediction_thread":
            job = history_anomaly_detection_prediction_thread
        case "stream_anomaly_detection_prediction_thread":
            job = stream_anomaly_detection_prediction_thread
        case "pv_monitoring_service_prediction_thread":
            job = pv_monitoring_service_prediction_thread
        case "pv_production_service_prediction_thread":
            job = pv_production_service_prediction_thread
        case "load_monitor_prediction_thread":
            job = load_monitor_prediction_thread
        case _:
            callback(f"unknown job: {job}")
            return

    # Run process_message function in a different process
    WORK_PROCESS = multiprocessing.Process(
        target=process_job, args=(job, callback), kwargs=kwargs)
    WORK_PROCESS.start()


def sigterm_handler(signum: int, frame: any):
    """ This handler waits for the work process to finish. 

    :param signum: SIGTERM singal number
    :type signum: int
    :param frame: _description_
    :type frame: any
    """
    # check if work process is not none, if so close it
    if WORK_PROCESS:
        logging.info("Received SIGTERM. Waiting for the process to finish...")
        WORK_PROCESS.join()

    # close connection to task queue
    if CONN:
        CONN.close()

    logging.info("Exiting after SIGTERM...")
    sys.exit(0)


def main():
    global CONN
    # Set up SIGTERM handler
    signal.signal(signal.SIGTERM, sigterm_handler)

    CONN = pika.BlockingConnection(
        pika.ConnectionParameters(host="rabbit-mq", heartbeat=300))
    channel = CONN.channel()

    task_queue = os.getenv("TASK_QUEUE")
    channel.queue_declare(queue=task_queue, durable=True)
    logging.info("Started AI Worker...")

    channel.basic_qos(prefetch_count=1)
    channel.basic_consume(queue=task_queue,
                          on_message_callback=on_message_callback)

    logging.info("Waiting for messages")
    channel.start_consuming()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO, format=FORMAT, datefmt=DATEFORMAT)
    logging.getLogger("urllib3").setLevel(logging.INFO)
    logging.getLogger("pika").setLevel(logging.INFO)

    main()
