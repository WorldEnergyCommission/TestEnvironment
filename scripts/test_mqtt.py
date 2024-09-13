import functools
import logging
import sys
import time

import paho.mqtt.client as mqtt
import tap


class ScriptArgumentParser(tap.Tap):
    username: str = ''
    password: str = ''
    use_authentication: bool = False
    host: str = 'test.mosquitto.org'
    port: int = 1883
    transport: str = 'tcp'
    use_tls: bool = False
    test_topic: str = 'test_topic/test_value'
    test_value: str = '[{"n":"test","v":42}]'
    timeout_seconds: int = 5
    self_signed_certificate_path: str = ''


def end_program(success: bool):
    if success:
        logging.info('The MQTT test was successful')
        sys.exit(0)
    else:
        logging.error('The MQTT test failed')
        sys.exit(-1)


def on_connect(client, userdata, rc):
    if rc != 0:
        logging.info(f'client was unable to connect and got the following error code: {rc}!')
        client.reconnect()
    else:
        logging.info('client connected successfully!')


def on_message(client, userdata, message, test_value, result_dict):
    logging.info(f"received message for topic: {message.topic}")
    logging.info(f"the payload was: {message.payload}")
    result_dict['result'] = test_value == message.payload.decode('utf-8')


def start_mqtt_client(username: str, password: str, host: str, port: int,
                      transport: str, use_tls: bool, test_topic: str, test_value: str,
                      timeout_seconds: int, use_authentication: bool, self_signed_certificate_path: str) -> None:
    client = mqtt.Client(transport=transport)
    result_dict = {'result': False}
    client.on_message = functools.partial(on_message, test_value=test_value, result_dict=result_dict)
    if use_authentication:
        client.username_pw_set(username, password)
    if use_tls:
        if self_signed_certificate_path:
            client.tls_set(ca_certs=self_signed_certificate_path)
        else:
            client.tls_set()
    client.connect(host, port)
    client.subscribe(test_topic)
    client.loop_start()
    client.publish(test_topic, test_value)
    time.sleep(timeout_seconds)
    client.loop_stop()
    end_program(result_dict['result'])


def main() -> None:
    logging.getLogger().setLevel(logging.INFO)
    args = ScriptArgumentParser().parse_args()
    start_mqtt_client(args.username, args.password, args.host, args.port,
                      args.transport, args.use_tls, args.test_topic, args.test_value,
                      args.timeout_seconds, args.use_authentication, args.self_signed_certificate_path)


if __name__ == '__main__':
    main()
