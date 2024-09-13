from ai.utils.mqtt_utils import get_cloud_to_device_mqtt_topic, publish_to_http


def turn_off_system(measurements: dict[str, list[dict[str, object]]]) -> None:
    """publish mqtt messages for a setpoint optimizer model"""

    for project_id, measurement in measurements.items():
        topic = get_cloud_to_device_mqtt_topic(project_id)
        measurement = [measurement]

        _ = publish_to_http([{
            "topic": topic,
            "values": measurement
        }])


def ready_to_turn_off(outdoor_temperature: float, room_temperature: float, solar_radiation: float,
                      room_set_temp: float, turned_off: bool) -> bool:
    """function that returns whether the system can be turned off"""

    if 19 < outdoor_temperature < 22:
        return True
    if (outdoor_temperature > 18) and (solar_radiation > 500):
        return True
    if (room_temperature > (room_set_temp + 2)) and not turned_off:
        return True
    if (room_temperature > room_set_temp) and turned_off:
        return True
    return False


def ready_to_turn_off_pid(room_temperature: float, setpoint_temperature) -> bool:
    """there is no need to turn off the pid controller as it will hold the setpoint temperature"""

    return False
