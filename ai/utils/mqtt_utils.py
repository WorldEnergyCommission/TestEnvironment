import logging
import os

import numpy as np
import paho.mqtt.client as mqtt
import requests

from ai.data_holder.consumption_service_data_holder import ConsumptionServiceDataHolder
from ai.data_holder.ems_data_holder import EmsDataHolder
from ai.data_holder.history_anomaly_detection_data_holder import HistoryAnomalyDetectionDataHolder
from ai.data_holder.pv_monitoring_service_data_holder import PvMonitoringServiceDataHolder
from ai.data_holder.pv_production_service_data_holder import PvProductionServiceDataHolder
from ai.data_holder.setpoint_optimizer_data_holder import SetpointOptimizerDataHolder
from ai.data_holder.stream_anomaly_detection_data_holder import StreamAnomalyDetectionDataHolder
from ai.data_holder.load_monitor_data_holder import LoadMonitorDataHolder
from ai.interface.data_holder import DataHolder
from ai.interface.status import Status
from ai.status.consumption_service_status import ConsumptionServiceStatus
from ai.status.ems_status import EmsStatus
from ai.status.history_anomaly_detection_status import HistoryAnomalyDetectionStatus
from ai.status.pv_monitoring_service_status import PvMonitoringServiceStatus
from ai.status.pv_production_service_status import PvProductionServiceStatus
from ai.status.setpoint_optimizer_status import SetpointOptimizerStatus
from ai.status.stream_anomaly_detection_status import StreamAnomalyDetectionStatus
from ai.status.load_monitor_status import LoadMonitorStatus
from ai.utils.env_utils import is_production_environment
from ai.utils.http_utils import get_empa_url, fetch_last_value
from ai.utils.request_utils import RequestSession, MEDIUM_TIMEOUT_SECONDS


def publish_to_http(measurements: list[dict[str, object]]) -> requests.Response:
    """publish measurements to the mqtt broker over http"""

    params = {
        'measurements': measurements
    }

    if is_production_environment():
        r = RequestSession.get_session().post(url=get_empa_url() + 'measurements',
                                              timeout=MEDIUM_TIMEOUT_SECONDS,
                                              json=params)
    else:
        r = RequestSession.get_session().get(url='https://www.google.com/',
                                             timeout=MEDIUM_TIMEOUT_SECONDS)

    return r


def get_device_to_cloud_mqtt_topic(project_id: str) -> str:
    """get mqtt topic for device to cloud communication"""

    return f'projects/{project_id}/messages'


def get_cloud_to_device_mqtt_topic(project_id: str) -> str:
    """get mqtt topic for cloud to device communication"""

    return f'projects/{project_id}/messages2'


def get_mqtt_topics_and_measurement_lists(dh: DataHolder) -> tuple[str, list[list[dict]], str, list[list[dict]]]:
    """get mqtt topics and lists for mqtt message generation"""

    status_topic = get_cloud_to_device_mqtt_topic(dh.project_id)
    status_measurements = []
    result_topic = get_device_to_cloud_mqtt_topic(dh.project_id)
    result_measurements = []
    return status_topic, status_measurements, result_topic, result_measurements


def fill_status_info_in_status_measurements(dh: DataHolder, status: Status, heartbeat: int,
                                            status_measurements: list[list[dict]],
                                            error_value: int = None, ready_value: int = None) -> None:
    """fill the status measurements list with status information"""

    if dh.heart_beat != "":
        status_measurements.append(
            [{"n": dh.heart_beat, "v": heartbeat}])
    if dh.error != "":
        status_measurements.append(
            [{"n": dh.error, "v": status.error if error_value is None else error_value}])
    if dh.ready != "":
        status_measurements.append(
            [{"n": dh.ready, "v": int(status.ready == 2) if ready_value is None else ready_value}])


def prepare_mqtt_messages(dh: DataHolder, status: Status, heartbeat: int) -> list[dict[str, object]]:
    """generate mqtt messages for any supported model"""

    if isinstance(dh, (PvProductionServiceDataHolder, ConsumptionServiceDataHolder)) and \
            isinstance(status, (PvProductionServiceStatus, ConsumptionServiceStatus)):
        return prepare_pv_production_consumption_service_mqtt_messages(dh, status, heartbeat)
    elif isinstance(dh, EmsDataHolder) and isinstance(status, EmsStatus):
        return prepare_ems_mqtt_messages(dh, status, heartbeat)
    elif isinstance(dh, PvMonitoringServiceDataHolder) and isinstance(status, PvMonitoringServiceStatus):
        return prepare_pv_monitoring_service_mqtt_messages(dh, status, heartbeat)
    elif isinstance(dh, LoadMonitorDataHolder) and isinstance(status, LoadMonitorStatus):
        return prepare_load_monitor_mqtt_messages(dh, status, heartbeat)
    elif isinstance(dh, SetpointOptimizerDataHolder) and isinstance(status, SetpointOptimizerStatus):
        return prepare_setpoint_optimizer_mqtt_messages(dh, status, heartbeat)
    elif isinstance(dh, (StreamAnomalyDetectionDataHolder, HistoryAnomalyDetectionDataHolder)) and \
            isinstance(status, (StreamAnomalyDetectionStatus, HistoryAnomalyDetectionStatus)):
        return prepare_stream_history_anomaly_detection_mqtt_messages(dh, status, heartbeat)
    else:
        raise ValueError('unsupported data holder type')


def calculate_heating_curve(predicted_sp: float, dh: SetpointOptimizerDataHolder, key: str) -> tuple[int, int]:
    """Calculate heating curve (y1, y2) based on limits"""

    epsilon = 0.25  # toleranz for heating curve

    system = None

    for sys in [dh.heating_water_systems, dh.heating_air_systems, dh.cooling_air_systems, dh.cooling_water_systems]:
        for c in sys:
            if c.identifier == key:
                system = c

    if not system:
        raise ValueError("Could not load heating curve limits")

    if not system.advanced_curve_settings:
        return predicted_sp+2.5, predicted_sp-2.5

    y1x = system.x_range["left"]
    y2x = system.x_range["right"]

    y1y_lower = system.y1_y_range["lower"]
    y1y_upper = system.y1_y_range["upper"]

    y2y_lower = system.y2_y_range["lower"]
    y2y_upper = system.y2_y_range["upper"]

    diff = system.y1_y2_diff

    # x = current outdoor temp
    x = fetch_last_value(dh.outdoor_temperature, dh.project_id)
    y = predicted_sp

    # if x (outside temp) is out of limits, set to limit
    if x > y2x:
        x = y2x
    elif x < y1x:
        x = y1x

    # Equation
    def equation(y1y, y2y):
        return ((y2y - y1y) / (y2x - y1x)) * (x-y1x) + y1y

    # Constraints
    def constraints(y1y, y2y):
        return (y2y <= y1y + diff) and \
            (y1y_lower <= y1y <= y1y_upper) and \
            (y2y_lower <= y2y <= y2y_upper)

    res = [(y1y, y2y, y2y-y1y) for y1y in range(y1y_lower, y1y_upper)
           for y2y in range(y2y_lower, y2y_upper)
           if (abs(y - equation(y1y, y2y)) < epsilon) and constraints(y1y, y2y)]

    if not res:
        if y >= y2y_upper:
            y1y = y1y_upper
            y2y = y2y_upper
            logging.warning('Heating curve set to max')
        elif y <= y2y_lower:
            # Ensure diff if both min limits are equal
            if y1y_lower == y2y_lower:
                y2y = y2y_lower
                y1y = y2y_lower - diff
            else:
                y1y = y1y_lower
                y2y = y2y_lower
            logging.warning('Heating curve set to min')
        else:
            logging.error('No values for Y1, Y2 in SPO found!')
            y1y = y+2.5
            y2y = y-2.5

    else:
        res_sorted = sorted(res, key=lambda x: x[2])[::-1]
        logging.debug(res_sorted)
        y1y, y2y = res_sorted[0][0:2]

    return y1y, y2y


def prepare_setpoint_optimizer_mqtt_messages(dh: SetpointOptimizerDataHolder,
                                             status: SetpointOptimizerStatus,
                                             heartbeat: int) -> list[dict[str, object]]:
    """prepare mqtt messages for the respective model"""

    status_topic, status_measurements, _, _ = get_mqtt_topics_and_measurement_lists(
        dh)

    fill_status_info_in_status_measurements(
        dh, status, heartbeat, status_measurements)

    if status.ready == 2:
        optimized_flow_temp = get_flow_temp(dh)  # [key, max limit, min limit]

        for key, result in status.write_to_mqtt.items():
            if optimized_flow_temp[key][0] != "":
                if optimized_flow_temp[key][1] and optimized_flow_temp[key][2]:
                    optimized_result = round(result, 2)

                    # cast to limits
                    if optimized_result > float(optimized_flow_temp[key][1]):
                        optimized_result = float(optimized_flow_temp[key][1])
                    elif optimized_result < float(optimized_flow_temp[key][2]):
                        optimized_result = float(optimized_flow_temp[key][2])

                    # create setpoint values Y1 and Y2
                    optimized_flow_temp_base_name = optimized_flow_temp[key][0]
                    optimized_flow_temp_y1_name = f'{optimized_flow_temp_base_name}_Y1'
                    optimized_flow_temp_y2_name = f'{optimized_flow_temp_base_name}_Y2'

                    y1, y2 = calculate_heating_curve(optimized_result, dh, key)

                    status_measurements.extend([
                        [{"n": optimized_flow_temp_base_name, "v": optimized_result}],
                        [{"n": optimized_flow_temp_y1_name, "v": float(y1)}],
                        [{"n": optimized_flow_temp_y2_name, "v": float(y2)}],
                    ])

    return [{"topic": status_topic,
             "values": status_measurements}]


def prepare_stream_history_anomaly_detection_mqtt_messages(
        dh: StreamAnomalyDetectionDataHolder | HistoryAnomalyDetectionDataHolder,
        status: StreamAnomalyDetectionStatus | HistoryAnomalyDetectionStatus,
        heartbeat: int) -> list[dict[str, object]]:
    """prepare mqtt messages for the respective model"""

    status_topic, status_measurements, result_topic, result_measurements = get_mqtt_topics_and_measurement_lists(
        dh)

    fill_status_info_in_status_measurements(
        dh, status, heartbeat, status_measurements)

    if status.ready == 2:
        score = status.anomaly_score

        result_measurements.append(
            [{"n": "AN." + dh.device_id.replace("-", "_") + ".score", "v": round(score, 2)}])

        if dh.anomaly_score != "":
            status_measurements.append(
                [{"n": dh.anomaly_score, "v": round(score, 2)}])

    return [{"topic": status_topic,
             "values": status_measurements},
            {"topic": result_topic,
             "values": result_measurements}]


def prepare_pv_monitoring_service_mqtt_messages(dh: PvMonitoringServiceDataHolder,
                                                status: PvMonitoringServiceStatus,
                                                heartbeat: int) -> list[dict[str, object]]:
    """prepare mqtt messages for the respective model"""

    status_topic, status_measurements, result_topic, result_measurements = get_mqtt_topics_and_measurement_lists(
        dh)

    fill_status_info_in_status_measurements(
        dh, status, heartbeat, status_measurements)

    if status.ready == 2:
        efficiency = status.efficiency

        result_measurements.append(
            [{"n": "PV." + dh.device_id.replace("-", "_") + ".efficiency", "v": round(efficiency, 2)}])

        if dh.efficiency != "":
            status_measurements.append(
                [{"n": dh.efficiency, "v": round(efficiency, 2)}])

    return [{"topic": status_topic,
             "values": status_measurements},
            {"topic": result_topic,
             "values": result_measurements}]


def prepare_load_monitor_mqtt_messages(dh: LoadMonitorDataHolder,
                                       status: LoadMonitorStatus,
                                       heartbeat: int) -> list[dict[str, object]]:
    """prepare mqtt messages for the respective model"""

    status_topic, status_measurements, result_topic, result_measurements = get_mqtt_topics_and_measurement_lists(
        dh)

    fill_status_info_in_status_measurements(
        dh, status, heartbeat, status_measurements)

    if status.ready == 2:
        load = status.load

        result_measurements.append(
            [{"n": dh.get_prediction_variable(), "v": load}])

    return [{"topic": status_topic,
             "values": status_measurements},
            {"topic": result_topic,
             "values": result_measurements}]


def prepare_pv_production_consumption_service_mqtt_messages(
        dh: PvProductionServiceDataHolder | ConsumptionServiceDataHolder,
        status: PvProductionServiceStatus | ConsumptionServiceStatus,
        heartbeat: int) -> list[dict[str, object]]:
    """prepare mqtt messages for the respective model"""

    status_topic, status_measurements, result_topic, result_measurements = get_mqtt_topics_and_measurement_lists(
        dh)

    fill_status_info_in_status_measurements(
        dh, status, heartbeat, status_measurements)

    preset = "PV."

    if status.ready == 2:
        total_energy = status.predicted_energy[-1]
        predicted_power = status.predicted_power[1]
        predicted_power_mean = np.mean(status.predicted_power).item(0)
        predicted_power_history = status.predicted_power_history
        _ = status.current_energy

        result_measurements.append(
            [{"n": preset + dh.device_id.replace("-", "_") + ".en", "v": round(total_energy, 2)}])
        result_measurements.append(
            [{"n": preset + dh.device_id.replace("-", "_") + ".pow", "v": round(predicted_power_history, 2)}])
        result_measurements.append(
            [{"n": preset + dh.device_id.replace("-", "_") + ".mean", "v": round(predicted_power_mean, 2)}])
        result_measurements.append(
            [{"n": preset + dh.device_id.replace("-", "_") + ".his", "v": round(predicted_power_history, 2)}])

        if dh.predicted_energy != "":
            status_measurements.append(
                [{"n": dh.predicted_energy, "v": round(total_energy)}])

        if dh.predicted_power != "":
            status_measurements.append(
                [{"n": dh.predicted_power, "v": round(predicted_power)}])

    return [{"topic": status_topic,
             "values": status_measurements},
            {"topic": result_topic,
             "values": result_measurements}]


def prepare_ems_mqtt_messages(dh: EmsDataHolder, status: EmsStatus, heartbeat: int) -> list[dict[str, object]]:
    """prepare mqtt messages for the respective model"""

    status_topic, status_measurements, result_topic, result_measurements = get_mqtt_topics_and_measurement_lists(
        dh)

    fill_status_info_in_status_measurements(dh, status, heartbeat, status_measurements,
                                            error_value=0 if dh.mode == 3 else None,
                                            ready_value=1 if dh.mode == 3 else None)

    if dh.enable_controlling != "":
        if dh.mode == 3:
            status_measurements.append([{"n": dh.enable_controlling,
                                         "v": 1}])
        elif status.winter_mode == 2:
            status_measurements.append([{"n": dh.enable_controlling,
                                         "v": 1}])
        else:
            status_measurements.append([{"n": dh.enable_controlling,
                                         "v": status.enable_controlling}])

    if status.ready == 2:
        if dh.calculated_battery_power != "":
            status_measurements.append([{"n": dh.calculated_battery_power,
                                         "v": round(float(status.predicted_power["bat_power"][0]), 2)}])

        for name, power in zip(
                [dh.pv.name, dh.generator.name, dh.grid.name, dh.battery.name, dh.charge_station.name,
                 dh.house.name, dh.electric_heating.name, dh.heating_pump.name, dh.big_consumer.name],
                [dh.pv.power, dh.generator.power, dh.grid.power,
                 dh.battery.power, dh.charge_station.power,
                 dh.house.power, dh.electric_heating.power, dh.heating_pump.power, dh.big_consumer.power]
        ):
            for n, p in zip(name, power):
                if p == "":
                    continue

                _ = round(float(status.predicted_power[n][1]), 2)
                predicted_power_history = float(
                    status.predicted_power_history[n])
                result_measurements.append(
                    [{"n": n + "." + dh.device_id.replace("-", "_") + ".pow", "v": predicted_power_history}])

        if "consumption" in status.predicted_energy.keys():
            _ = float(status.predicted_power["consumption"][1])
            predicted_power_mean = np.mean(
                status.predicted_power["consumption"]).item(0)
            predicted_power_history = float(
                status.predicted_power_history["consumption"])

            result_measurements.append(
                [{"n": "con." + dh.device_id.replace("-", "_") + ".pow", "v": predicted_power_history}])
            result_measurements.append(
                [{"n": "con." + dh.device_id.replace("-", "_") + ".mean", "v": predicted_power_mean}])

    return [{"topic": status_topic,
             "values": status_measurements},
            {"topic": result_topic,
             "values": result_measurements}]


def initialize_mqtt_client(username: str = None, password: str = None) -> mqtt.Client:
    """create a new mqtt client with the passed username and password"""

    mqtt_client = mqtt.Client(protocol=mqtt.MQTTv5)
    # enable tls
    mqtt_cert_path = os.getenv('MQTT_CERT_PATH')
    if mqtt_cert_path:
        mqtt_client.tls_set(ca_certs=mqtt_cert_path)
    # set username and password
    if username is not None and password is not None:
        mqtt_client.username_pw_set(username, password)
    # connect to the broker
    mqtt_client.connect(os.getenv('MQTT_HOST'), int(os.getenv('MQTT_PORT')))
    # start network loop to be able to support qos up to 2
    mqtt_client.loop_start()
    logging.info('successfully connected to the mqtt broker')
    return mqtt_client


def get_flow_temp(dh: SetpointOptimizerDataHolder) -> dict[str, list[float]]:
    """returns the variables used to publish the optimized flow temperatures"""

    result = {}

    for sys in [dh.heating_water_systems, dh.heating_air_systems, dh.cooling_air_systems, dh.cooling_water_systems]:
        for c in sys:
            result[c.identifier] = [c.optimized_flow_temperature,
                                    c.max_flow_temperature, c.min_flow_temperature]

    for sys in [dh.hybrid_water_systems, dh.hybrid_air_systems]:
        for c in sys:
            mode = fetch_last_value(c.status, dh.project_id)
            if mode == 1:
                result[c.identifier] = [c.optimized_flow_temperature, c.max_flow_temperature["heating"],
                                        c.min_flow_temperature["heating"]]
            else:
                result[c.identifier] = [c.optimized_flow_temperature, c.max_flow_temperature["cooling"],
                                        c.min_flow_temperature["cooling"]]

    return result
