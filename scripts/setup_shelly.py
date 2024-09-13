import contextlib
import logging
import re
import socket
import time
from dataclasses import dataclass
from enum import Enum
from typing import Callable

import pandas as pd
import pywifi
import pywifi.iface
import requests
import tap
from scapy.all import ARP, Ether, srp

HTTP_PROTOCOL = 'http://'
HTTPS_PROTOCOL = 'https://'

OLD_LOCAL_SHELLY_IP = '192.168.33.1'
NEW_LOCAL_SHELLY_IP = '192.168.4.1'
MACVENDORS_HOST = 'macvendors.com'


class ShellyMode(Enum):
    AP = 0
    STA = 1


class ApplianceCatagories(Enum):
    AC = 'AIR_CONDITIONER'
    CA = 'COOKING_APPLIANCES'
    DW = 'DISHWASHER'
    EB = 'ELECTRIC_BOILER'
    EIWH = 'ELECTRIC_INSTANTANEOUS_WATER_HEATER'
    EH = 'ELECTRIC_HEATING'
    EV = 'ELECTRIC_VEHICLE'
    FRI = 'FRIDGE'
    FRE = 'FREEZER'
    FAF = 'FRIDGE_AND_FREEZER'
    KET = 'KETTLE'
    L = 'LIGHTING'
    TV = 'TV'
    OE = 'OTHER_ENTERTAINMENT'
    TD = 'TUMBLE_DRYER'
    WM = 'WASHING_MACHINE'
    HP = 'HEATING_PUMP'
    PP = 'POOL_PUMP'
    WP = 'WHIRLPOOL'
    ROOT = 'ROOT'
    WD = 'WASH_DRYER'


@dataclass(frozen=True, order=True, kw_only=True)
class ShellyDevice:
    generation: int
    phase_amount: int
    name: str
    id: str
    profile: pywifi.Profile | None
    ip: str
    mode: ShellyMode
    switchable: bool


@dataclass(frozen=True, order=True, kw_only=True)
class NetworkDevice:
    ip: str
    mac: str
    host_name: str
    manufacturer: str | None


class ScriptArgumentParser(tap.Tap):
    local_ssid: str
    local_password: str
    target_ssid: str = ''
    target_password: str = ''
    user: str = ''
    category: str = ''
    manufacturer: str = ''
    model: str = ''
    connect_offline_shellies: bool = True
    local_subnet_mask: str = '10.0.0.0/24'
    mqtt_host: str = 'mqtt.efficientio.io'
    mqtt_port: int = 1883
    mqtt_user: str | None = '63203dc6-e474-4a5a-87f7-0f51d6a6d0ab'
    mqtt_pass: str | None = '5063b421-b95e-4504-8e19-cd1eb76ddc94'


class WifiInterface:
    wifi_interface: pywifi.iface.Interface | None = None

    @classmethod
    def get_wifi_interface(cls) -> pywifi.iface.Interface:
        if cls.wifi_interface is None:
            cls.wifi_interface = pywifi.PyWiFi().interfaces()[0]
        return cls.wifi_interface


def wait_until_callback_is_true(callback: Callable[[], bool], initial_wait_seconds: float = 5,
                                check_interval_seconds: float = 0.1,
                                timeout_seconds: float = 10):
    time.sleep(initial_wait_seconds)
    wait_seconds = initial_wait_seconds
    while not callback():
        time.sleep(check_interval_seconds)
        wait_seconds += check_interval_seconds
        if wait_seconds >= timeout_seconds:
            raise RuntimeError


def wifi_connect_to_profile(profile: pywifi.Profile, key: str | None = None) -> None:
    connect_profile = pywifi.Profile()
    connect_profile.ssid = profile.ssid
    connect_profile.bssid = profile.bssid
    connect_profile.auth = pywifi.const.AUTH_ALG_OPEN
    connect_profile.akm.append(pywifi.const.AKM_TYPE_NONE if key is None else pywifi.const.AKM_TYPE_WPA2PSK)
    connect_profile.cipher = pywifi.const.CIPHER_TYPE_NONE if key is None else pywifi.const.CIPHER_TYPE_CCMP
    connect_profile.key = key
    config = WifiInterface.get_wifi_interface().add_network_profile(connect_profile)
    WifiInterface.get_wifi_interface().connect(config)
    wait_until_callback_is_true(lambda: WifiInterface.get_wifi_interface().status() == pywifi.const.IFACE_CONNECTED)


def wifi_disconnect_from_profile(profile: pywifi.Profile) -> None:
    WifiInterface.get_wifi_interface().remove_network_profile(profile)
    wait_until_callback_is_true(lambda: WifiInterface.get_wifi_interface().status() == pywifi.const.IFACE_CONNECTED)


@contextlib.contextmanager
def connect_to_shelly(device: ShellyDevice) -> None:
    try:
        if device.mode == ShellyMode.AP:
            yield wifi_connect_to_profile(device.profile)
        else:
            yield None
    finally:
        if device.mode == ShellyMode.AP:
            wifi_disconnect_from_profile(device.profile)
        else:
            pass


def get_shelly_info_for_name(name: str) -> dict | None:
    if match := re.fullmatch('ShellyPro1PM-([A-Z0-9]{12})', name):
        return {'generation': 2, 'name': 'Shelly Pro 1 PM', 'id': match.group(1), 'ip': OLD_LOCAL_SHELLY_IP,
                'phase_amount': 1, 'switchable': True}
    elif match := re.fullmatch('shellypro1pm-([a-z0-9]{12})', name):
        return {'generation': 2, 'name': 'Shelly Pro 1 PM', 'id': match.group(1).upper(), 'ip': OLD_LOCAL_SHELLY_IP,
                'phase_amount': 1, 'switchable': True}
    elif match := re.fullmatch('ShellyPlusPlugS-([A-Z0-9]{12})', name):
        return {'generation': 2, 'name': 'Shelly Plus Plug S', 'id': match.group(1).upper(), 'ip': OLD_LOCAL_SHELLY_IP,
                'phase_amount': 1, 'switchable': True}
    elif match := re.fullmatch('shellyplusplugs-([a-z0-9]{12})', name):
        return {'generation': 2, 'name': 'Shelly Plus Plug S', 'id': match.group(1).upper(), 'ip': OLD_LOCAL_SHELLY_IP,
                'phase_amount': 1, 'switchable': True}
    elif match := re.fullmatch('ShellyPro3EM-([A-Z0-9]{12})', name):
        return {'generation': 2, 'name': 'Shelly Pro 3 EM', 'id': match.group(1), 'ip': OLD_LOCAL_SHELLY_IP,
                'phase_amount': 3, 'switchable': False}
    elif match := re.fullmatch('shellypro3em-([a-z0-9]{12})', name):
        return {'generation': 2, 'name': 'Shelly Pro 3 EM', 'id': match.group(1).upper(), 'ip': OLD_LOCAL_SHELLY_IP,
                'phase_amount': 3, 'switchable': False}
    elif match := re.fullmatch('ShellyPro3EM400-([A-Z0-9]{12})', name):
        return {'generation': 2, 'name': 'Shelly Pro 3 EM 400', 'id': match.group(1), 'ip': OLD_LOCAL_SHELLY_IP,
                'phase_amount': 3, 'switchable': False}
    elif match := re.fullmatch('shellypro3em400-([a-z0-9]{12})', name):
        return {'generation': 2, 'name': 'Shelly Pro 3 EM 400', 'id': match.group(1).upper(), 'ip': OLD_LOCAL_SHELLY_IP,
                'phase_amount': 3, 'switchable': False}
    elif match := re.fullmatch('shellyplug-([A-Z0-9]{6})', name):
        return {'generation': 1, 'name': 'Shelly Plug', 'id': match.group(1), 'ip': OLD_LOCAL_SHELLY_IP,
                'phase_amount': 1, 'switchable': True}
    elif match := re.fullmatch('ESP_([A-Z0-9]{6})', name):
        return {'generation': 1, 'name': 'Shelly', 'id': match.group(1), 'ip': NEW_LOCAL_SHELLY_IP,
                'phase_amount': 1, 'switchable': True}
    else:
        return None


def get_ap_mode_shelly_device_from_profile(profile: pywifi.Profile) -> ShellyDevice | None:
    common_kwargs = {'profile': profile, 'mode': ShellyMode.AP}
    shelly_info = get_shelly_info_for_name(profile.ssid)
    if shelly_info is None:
        return None
    return ShellyDevice(**shelly_info, **common_kwargs)


def get_sta_mode_shelly_device_from_network_device(device: NetworkDevice) -> ShellyDevice | None:
    common_kwargs = {'profile': None, 'ip': device.ip, 'mode': ShellyMode.STA}
    shelly_info = get_shelly_info_for_name(device.host_name)
    if shelly_info is None:
        return None
    return ShellyDevice(**{**shelly_info, **common_kwargs})


def get_ap_mode_shelly_devices(scan_seconds: int = 16) -> tuple[ShellyDevice, ...]:
    WifiInterface.get_wifi_interface().scan()
    time.sleep(scan_seconds)
    profiles: list[pywifi.Profile] = WifiInterface.get_wifi_interface().scan_results()
    shelly_devices = tuple(
        filter(lambda x: x is not None, [get_ap_mode_shelly_device_from_profile(profile) for profile in profiles]))
    return shelly_devices


def get_manufacturer_for_mac_address(mac: str) -> str:
    response = requests.get(f'{HTTPS_PROTOCOL}{MACVENDORS_HOST}/query/{mac}')
    if not response.ok:
        raise RuntimeError
    else:
        return response.content.decode('utf-8').strip()


def get_host_name_for_ip(ip: str) -> str:
    info = socket.getnameinfo((ip, 0), 0)
    return info[0]


def get_network_devices(
        subnet_masks: tuple[str, ...],
        fetch_manufacturer: bool = False,
        scan_seconds: float = 4) -> tuple[NetworkDevice, ...]:
    devices = []
    for subnet_mask in subnet_masks:
        arp = ARP(pdst=subnet_mask)
        ether = Ether(dst='ff:ff:ff:ff:ff:ff')
        packet = ether / arp
        result = srp(packet, timeout=scan_seconds, retry=4, verbose=0)[0]
        for sent, received in result:
            if fetch_manufacturer:
                manufacturer = get_manufacturer_for_mac_address(received.hwsrc)
            else:
                manufacturer = None
            devices.append(NetworkDevice(ip=received.psrc,
                                         mac=received.hwsrc,
                                         host_name=get_host_name_for_ip(received.psrc),
                                         manufacturer=manufacturer))
    return tuple(devices)


def get_sta_mode_shelly_devices(subnet_masks: tuple[str, ...]) -> tuple[ShellyDevice, ...]:
    network_devices = get_network_devices(subnet_masks)
    shelly_devices = tuple(
        filter(lambda x: x is not None,
               [get_sta_mode_shelly_device_from_network_device(device) for device in network_devices]))
    return shelly_devices


def call_shelly_http_endpoint(device: ShellyDevice, method: str, path: str,
                              params: dict[str, str] | None = None,
                              headers: dict[str, str] | None = None,
                              json: object | None = None,
                              response_expected: bool = True) -> dict | None:
    with connect_to_shelly(device):
        if device.generation == 1:
            response = requests.request(method, f'{HTTP_PROTOCOL}{device.ip}{path}', params=params, headers=headers,
                                        json=json)
        else:
            raise ValueError
        if not response.ok:
            raise RuntimeError
        if response_expected:
            return response.json()
        else:
            return None


def call_shelly_rpc_endpoint(device: ShellyDevice,
                             method: str,
                             json: object | None = None,
                             response_expected: bool = True) -> dict | None:
    with connect_to_shelly(device):
        if device.generation == 2:
            response = requests.post(f'{HTTP_PROTOCOL}{device.ip}/rpc/{method}', json=json)
        else:
            raise ValueError
        if not response.ok:
            raise RuntimeError
        if response_expected:
            return response.json()
        else:
            return None


def get_shelly_status(device: ShellyDevice) -> dict:
    logging.info(f'getting the status of shelly device {device} ...')
    if device.generation == 1:
        response = call_shelly_http_endpoint(device, 'GET', '/status')
    elif device.generation == 2:
        response = call_shelly_rpc_endpoint(device, 'Shelly.GetConfig')
    else:
        raise ValueError
    logging.info(f'shelly device {device} returned the following status: {response}')
    return response


def reboot_shelly(device: ShellyDevice, reboot_seconds: int = 10) -> None:
    logging.info(f'rebooting the shelly device {device} ...')
    if device.generation == 1:
        call_shelly_http_endpoint(device, 'GET', '/reboot', response_expected=False)
    elif device.generation == 2:
        call_shelly_rpc_endpoint(device, 'Shelly.Reboot', response_expected=False)
    else:
        raise ValueError
    logging.info(f'reboot request was sent to shelly device {device}')
    time.sleep(reboot_seconds)


def setup_shelly_wifi(device: ShellyDevice, ssid: str, key: str = '') -> None:
    logging.info(f'setting the Wi-Fi state of shelly device {device} ...')
    if device.generation == 1:
        response = call_shelly_http_endpoint(device, 'GET', '/settings/sta',
                                             params={'ssid': ssid, 'enabled': 'true', 'key': key})
    elif device.generation == 2:
        call_shelly_rpc_endpoint(device, 'WiFi.SetConfig',
                                 json={'config': {'sta': {'ssid': ssid, 'pass': key, 'enable': True}}})
        response = get_shelly_status(device)
    else:
        raise ValueError
    logging.info(f'the shelly device {device} reported the following Wi-Fi status: {response}')
    if device.generation == 1:
        if not response['enabled'] or response['ssid'] != ssid:
            raise RuntimeError
    elif device.generation == 2:
        if not response['wifi']['sta']['enable'] or response['wifi']['sta']['ssid'] != ssid:
            raise RuntimeError
    else:
        raise ValueError


def setup_shelly_ap_mode(device: ShellyDevice) -> None:
    logging.info(f'setting the AP mode of shelly device {device} ...')
    if device.generation == 1:
        response = call_shelly_http_endpoint(device, 'GET', '/settings/ap',
                                             params={'enabled': 'true'})
        if not response['enabled']:
            raise RuntimeError
    elif device.generation == 2:
        call_shelly_rpc_endpoint(device, 'WiFi.SetConfig',
                                 json={'config': {'ap': {'is_open': True, 'enable': True}}})
        response = get_shelly_status(device)
        if not response['wifi']['ap']['enable']:
            raise RuntimeError
    else:
        raise ValueError
    logging.info(f'the shelly device {device} reported the following AP mode status: {response}')


def perform_shelly_ota_update(
        device: ShellyDevice, reboot_seconds: float = 20,
        update_checks: int = 4, channel: str = 'beta') -> None:
    logging.info(f'starting OTA update of shelly device {device} ...')
    check_response = {}
    for i in range(update_checks):
        if device.generation == 1:
            check_response = call_shelly_http_endpoint(device, 'GET', '/ota/check')
        elif device.generation == 2:
            check_response = call_shelly_rpc_endpoint(device, 'Shelly.CheckForUpdate')
        else:
            raise ValueError
    if device.generation == 1:
        update_response = call_shelly_http_endpoint(device, 'GET', '/ota', params={'update': 'true'})
        if update_response['status'] != 'updating':
            raise RuntimeError
    elif device.generation == 2:
        if channel in check_response:
            update_response = call_shelly_rpc_endpoint(device, 'Shelly.Update', {'stage': channel})
            if update_response is not None:
                raise RuntimeError
    else:
        raise ValueError
    time.sleep(reboot_seconds)
    for i in range(update_checks):
        if device.generation == 1:
            call_shelly_http_endpoint(device, 'GET', '/ota/check')
        elif device.generation == 2:
            call_shelly_rpc_endpoint(device, 'Shelly.CheckForUpdate')
        else:
            raise ValueError
    if device.generation == 1:
        check_response = call_shelly_http_endpoint(device, 'GET', '/ota')
        if check_response['has_update']:
            raise RuntimeError
    elif device.generation == 2:
        check_response = call_shelly_rpc_endpoint(device, 'Shelly.CheckForUpdate')
        if channel in check_response:
            raise RuntimeError
    else:
        raise ValueError
    logging.info(f'the shelly device {device} reported the following OTA update status: {check_response}')


def set_default_switch_state(device: ShellyDevice, default_switch_state: str = 'on') -> None:
    if not device.switchable:
        return
    for phase_id in range(device.phase_amount):
        logging.info(f'setting the default switch {phase_id} state for {device} ...')
        if device.generation == 1:
            response = call_shelly_http_endpoint(device, 'GET', f'/settings/relay/{phase_id}',
                                                 params={'default_state': default_switch_state})
            if response['default_state'] != default_switch_state:
                raise RuntimeError
        elif device.generation == 2:
            call_shelly_rpc_endpoint(device, 'Switch.SetConfig',
                                     {'id': phase_id, 'config': {'initial_state': default_switch_state}})
            response = call_shelly_rpc_endpoint(device, 'Switch.GetConfig', {'id': phase_id})
            if response['initial_state'] != default_switch_state:
                raise RuntimeError
        else:
            raise ValueError
        logging.info(f'set the default switch {phase_id} state for {device} to {default_switch_state}')


def sanitize_string(value: str) -> str:
    return re.sub('\\s', '_', value.strip().lower()).replace('/', '_')


def setup_mqtt_on_shelly(device: ShellyDevice, mqtt_host: str, mqtt_port: int,
                         user: str, category: str, manufacturer: str, model: str,
                         mqtt_user: str | None = None, mqtt_pass: str | None = None,
                         update_interval_seconds: int = 1, mqtt_qos: int = 2,
                         reconnect_seconds: int = 10,
                         script_name: str = 'mqtt_script'):
    logging.info(f'setting the MQTT broker on shelly device {device} ...')
    client_id = '/'.join(
        map(sanitize_string, (device.id, device.name, f'gen{device.generation}', user, category, manufacturer, model)))
    mqtt_server = f'{mqtt_host}:{mqtt_port}'
    if device.generation == 1:
        params = {'mqtt_enable': 'true', 'mqtt_server': mqtt_server,
                  'mqtt_update_period': update_interval_seconds,
                  'mqtt_id': client_id, 'mqtt_max_qos': mqtt_qos,
                  'mqtt_clean_session': 'true', 'mqtt_retain': 'false',
                  'mqtt_reconnect_timeout_max': reconnect_seconds,
                  'mqtt_reconnect_timeout_min': 1, 'mqtt_keep_alive': reconnect_seconds}
        if mqtt_user is not None:
            params['mqtt_user'] = mqtt_user
        if mqtt_pass is not None:
            params['mqtt_pass'] = mqtt_pass
        response = call_shelly_http_endpoint(device, 'GET', '/settings',
                                             params=params)
        if not response['mqtt']['enable'] or response['mqtt']['server'] != mqtt_server:
            raise RuntimeError
    elif device.generation == 2:
        params = {'enable': True, 'server': mqtt_server, 'client_id': client_id, 'topic_prefix': client_id,
                  'ssl_ca': None, 'rpc_ntf': False, 'status_nrf': False, 'use_client_cert': False,
                  'enable_control': False}
        if mqtt_user is not None:
            params['user'] = mqtt_user
        if mqtt_pass is not None:
            params['pass'] = mqtt_pass
        call_shelly_rpc_endpoint(device, 'MQTT.SetConfig', {'config': params})
        response = get_shelly_status(device)
        if not response['mqtt']['enable'] or response['mqtt']['server'] != mqtt_server:
            raise RuntimeError
    else:
        raise ValueError
    logging.info(f'the shelly device {device} reported the following MQTT status: {response}')
    if device.generation == 2:
        logging.info(f'clearing the scripts of shelly device {device} ...')
        response = call_shelly_rpc_endpoint(device, 'Script.List')
        for script in response['scripts']:
            call_shelly_rpc_endpoint(device, 'Script.Delete', {'id': script['id']})
        logging.info(f'creating the script {script_name} on the shelly device {device} ...')
        mqtt_script = call_shelly_rpc_endpoint(device, 'Script.Create', {'name': script_name})
        with open('shelly_script.js') as file:
            script_code = file.read()
        call_shelly_rpc_endpoint(device, 'Script.PutCode', {'id': mqtt_script['id'], 'code': script_code})
        logging.info(f'enabling the script {script_name} on the shelly device {device} ...')
        call_shelly_rpc_endpoint(device, 'Script.SetConfig', {'id': mqtt_script['id'], 'config': {'enable': True}})
    reboot_shelly(device)


def check_category(category: str):
    possible_categories = tuple([x.value for x in ApplianceCatagories])
    if not category.lower() in map(str.lower, possible_categories):
        raise RuntimeError(f'only the following categories are allowed: {possible_categories}')


def setup_shelly(args: ScriptArgumentParser) -> list[str]:
    if args.connect_offline_shellies:
        logging.info('searching for Shelly devices in AP mode via Wi-Fi ...')
        ap_mode_shellies = get_ap_mode_shelly_devices()
        if len(ap_mode_shellies) == 0:
            raise RuntimeError('no shellies found')
        logging.info(f'found the following devices in AP mode: {ap_mode_shellies}')
        for ap_mode_shelly in ap_mode_shellies:
            setup_shelly_wifi(ap_mode_shelly, args.local_ssid, args.local_password)
        logging.info(f'waiting for the shellies to come back online ... ')
        time.sleep(10)
    logging.info('searching for Shelly devices in STA mode via Wi-Fi ...')
    sta_mode_shellies = get_sta_mode_shelly_devices((args.local_subnet_mask,))
    if len(sta_mode_shellies) == 0:
        raise RuntimeError('no shellies found')
    logging.info(f'found the following devices in STA mode: {sta_mode_shellies}')
    for sta_mode_shelly in sta_mode_shellies:
        perform_shelly_ota_update(sta_mode_shelly)
        set_default_switch_state(sta_mode_shelly)
        setup_mqtt_on_shelly(sta_mode_shelly, args.mqtt_host, args.mqtt_port, args.user, args.category,
                             args.manufacturer, args.model, args.mqtt_user, args.mqtt_pass)
        setup_shelly_wifi(sta_mode_shelly, args.target_ssid, args.target_password)
    return [shelly.id for shelly in sta_mode_shellies]


def main() -> None:
    logging.getLogger().setLevel(logging.INFO)
    args = ScriptArgumentParser().parse_args()
    shelly_configurations = pd.read_csv('shellies.csv')
    for _, shelly_configuration in shelly_configurations.iterrows():
        # early exit if the shelly was set up already
        if shelly_configuration['shelly_id (do not fill out)'] != 'not yet given':
            continue
        # check the category
        check_category(shelly_configuration['category'])
        # setup the correct parameters
        args.target_ssid = shelly_configuration['wifi_ssid (2.4GHz)']
        args.target_password = shelly_configuration['wifi_password']
        args.user = shelly_configuration['user']
        args.category = ApplianceCatagories(shelly_configuration['category']).name
        args.manufacturer = shelly_configuration['manufacturer']
        args.model = shelly_configuration['model']
        # make sure the preparations are done
        logging.info(f'next arguments are {args} ...')
        logging.info(
            f'enter the last id in the csv file, disconnect all shellies from power and plug in the next shelly ...')
        input('Press ENTER if all preparations are done ...')
        # start the shelly setup
        shelly_ids = setup_shelly(args)
        logging.info(f'successfully set up shellies with ids {shelly_ids} ...')


if __name__ == '__main__':
    main()
