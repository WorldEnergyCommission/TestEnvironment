import json
import time


def get_senml_dict(name: str, value: float, unit: str = '', timestamp: float = 0) -> dict[str, object]:
    """generate a senml object that may be published to the mqtt broker"""

    return {
        'n': name,
        'v': value,
        'u': unit,
        't': timestamp
    }


def generate_senml_message(name: str, value: float, unit: str = '', timestamp: float = None) -> str:
    """generate a senml message ready to be published to the mqtt broker"""

    if timestamp is None:
        timestamp = time.time()
    message = [get_senml_dict(name, value, unit, timestamp)]
    return json.dumps(message)
