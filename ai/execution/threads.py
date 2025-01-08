import datetime
import logging
import multiprocessing
import os
import time
import traceback
import typing

import numpy as np
import pandas as pd
import pytz

from ai.interface.model_holder import ModelHolder
from ai.model.setpoint_optimizer_model import SetpointOptimizerModel
from ai.model_holder.consumption_service_model_holder import ConsumptionServiceModelHolder
from ai.model_holder.ems_model_holder import EmsModelHolder
from ai.model_holder.history_anomaly_detection_model_holder import HistoryAnomalyDetectionModelHolder
from ai.model_holder.pv_monitoring_service_model_holder import PvMonitoringServiceModelHolder
from ai.model_holder.pv_production_service_model_holder import PvProductionServiceModelHolder
from ai.model_holder.setpoint_optimizer_model_holder import SetpointOptimizerModelHolder
from ai.model_holder.stream_anomaly_detection_model_holder import StreamAnomalyDetectionModelHolder
from ai.model_holder.load_monitor_model_holder import LoadMonitorModelHolder
from ai.preprocessing.ems_preprocessing import get_ems_features, preprocess_ems_data
from ai.preprocessing.pv_monitoring_service_preprocessing import preprocess_pv_monitoring_service_data
from ai.preprocessing.pv_production_consumption_service_preprocessing import (
    get_pv_production_consumption_service_features,
    preprocess_pv_production_consumption_service_data)
from ai.preprocessing.setpoint_optimizer_preprocessing import preprocess_setpoint_optimizer_data
from ai.preprocessing.load_monitor_preprocessing import preprocess_load_monitor_data
from ai.utils.ems_function_utils import (calculate_battery_prediction, calculate_capacities, calculate_loading_phase,
                                         format_grid_for_optimization,
                                         get_energy_price_time, get_prices, optimize_battery_power,
                                         publish_heating_pumps, consumer_correction, get_devices_sum)
from ai.utils.energy_utils import calculate_energy_of_day
from ai.utils.http_utils import fetch_last_value
from ai.utils.logging_utils import configure_logging_listener
from ai.utils.mqtt_utils import prepare_mqtt_messages, publish_to_http
from ai.utils.multiprocessing_utils import get_current_memory_info, start_process
from ai.utils.setpoint_optimizer_function_utils import turn_off_system
from ai.utils.thread_utils import (check_controller_state, check_state_and_fetch_data, extract_daily_data,
                                   get_stream_history_anomaly_detection_features_with_error_handling,
                                   prepare_timestamps, set_state_to_trained)
from ai.utils.time_utils import get_most_recent_timestamp_from_df
from ai.utils.train_utils import train_model
from ai.utils.weather_utils import fetch_forecast
from ai.weather.weather_holder import WeatherHolder


def is_model_updated_in_prediction(model_holder: ModelHolder) -> bool:
    """returns if the model is updated during prediction, in this case the model
    needs to be reset on initial startup to prevent model overwriting at the prediction model store"""

    if isinstance(model_holder, (SetpointOptimizerModelHolder, StreamAnomalyDetectionModelHolder)):
        return True
    else:
        return False


def log_weather_thread(project_id: str, _: typing.Type[WeatherHolder]) -> None:
    """fetches all weather data and saves it to a postgres database through a http interface"""

    logger = logging.getLogger('log_weather_thread')
    logger.debug("starting thread with pid: %d", os.getpid())

    weather_holder = WeatherHolder.load_weather_holder_from_s3(project_id)

    try:
        df = fetch_forecast(weather_holder.get_site_id(), action="getsolarsat")
        measurements = weather_holder.get_weather_measurements(df.iloc[-1])
        publish_to_http(measurements)
    except Exception as e:
        logger.error(
            f"error weather logging for site {weather_holder.to_dict()}: {repr(e)}")
    finally:
        try:
            del weather_holder, df
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def heartbeat_thread(model_id: str, model_holder_type: typing.Type[ModelHolder],
                     global_state: multiprocessing.managers.Namespace) -> None:
    """send heartbeat messages for the models"""

    import time

    start = time.time()

    logger = logging.getLogger('heartbeat_thread')
    logger.debug("starting thread with pid: %d", os.getpid())

    start_s3 = time.time()

    model_holder = ModelHolder.load_model_holder_from_s3(
        model_id, model_holder_type, model_load=False)

    logger.info(
        f"[HEARTBEAT] Loading from S3 for {model_id} took {time.time()-start_s3} sec!")

    try:
        logger.info(
            f"heartbeat value for {model_id} is {int(global_state.heartbeat)}")
        measurements = []
        try:
            """IMPORTANT: heartbeat is sent to EMS alternating between 0 and 1, 
            if scheduling is changed this also needs to be addressed"""
            measurements = prepare_mqtt_messages(
                model_holder.get_dh(), model_holder.get_status(), int(global_state.heartbeat))
            r = publish_to_http(measurements)
            if r.status_code != 200:
                raise KeyError(r.text + str(r.status_code))
        except Exception as e:
            logger.error('error generating measurements: %s, for model:',
                         e, model_holder.get_model_id())
            model_holder.set_status(
                status=f"error heartbeat: {repr(e)}\n"f"measurements: {measurements}")
            ModelHolder.store_model_holder_to_s3(
                model_holder, common_status_store=True)
    except Exception as e:
        logger.error(f'error during sending of MQTT messages: {repr(e)}')
    finally:
        try:
            del model_holder, measurements
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())
        logger.info(
            f"[HEARTBEAT] Thread for {model_id} took {time.time()-start} sec!")


def train_model_daily_thread(
        model_id: str, model_holder_type: typing.Type[
            PvProductionServiceModelHolder | ConsumptionServiceModelHolder | EmsModelHolder | LoadMonitorModelHolder]) -> None:
    """thread that retrains the light models every day"""

    logger = logging.getLogger('train_light_models_daily')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = ModelHolder.load_model_holder_from_s3(
        model_id, model_holder_type, model_load=False)

    try:
        # if the controller is currently training then updating it would make no sense
        try:
            if model_holder.get_training_from_state():
                return
        except KeyError:
            return
        # now the updating progress will be initialized
        try:
            # set the state to updating
            model_holder.set_status(training=True, status="updating")
            ModelHolder.store_model_holder_to_s3(
                model_holder, common_status_store=True)
            # train the controller
            train_model_thread(model_id, model_holder_type, True)
        except Exception as e:
            model_holder.set_status(status=f"(error update) training model: {repr(e)}",
                                    error=2, ready=0, training=False)
            ModelHolder.store_model_holder_to_s3(
                model_holder, common_status_store=True)
            return
    except Exception as e:
        logger.error(f'error during the update of controllers: {repr(e)}')
    finally:
        try:
            del model_holder
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def pv_production_service_prediction_thread(
        model_id: str, _: typing.Type[PvProductionServiceModelHolder]) -> None:
    """compute pv production service predictions"""

    logger = logging.getLogger('pv_production_service_prediction')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = PvProductionServiceModelHolder.load_model_holder_from_s3(
        model_id)

    try:
        ts_start, ts_end, tsd0, should_continue = prepare_timestamps()

        df, should_continue = check_state_and_fetch_data(
            model_holder, ts_start, ts_end)
        if should_continue:
            return
        try:
            df = preprocess_pv_production_consumption_service_data(df)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) processing data: " + str(e))
            return
        try:
            if model_holder.get_data_type() != 3:
                x, _ = get_pv_production_consumption_service_features(
                    df, [15, 30, 45, 60], [15, 30, 45, 60], 15)
            else:
                x, _ = get_pv_production_consumption_service_features(df, lag_steps=[15, 30, 45, 60],
                                                                      prediction_steps=[
                                                                          15, 30, 45, 60],
                                                                      time_resolution=15, lag_label=[15])
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) feature processing data: " + str(e))
            return
        x, should_continue = extract_daily_data(x, tsd0, model_holder)
        if should_continue:
            return
        try:
            pv, en = model_holder.get_model().predict(x, model_holder.get_data_type() == 3)
            model_holder.set_predictions(pv, en)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) model prediction: " + str(e), error=2, ready=0)
            return
        try:
            model_holder.set_daily_energy(calculate_energy_of_day(
                model_holder.get_power_variable(), model_holder.get_project_id()))
        except Exception as e:
            model_holder.set_status(status="(error prediction) energy calculation: " + str(e),
                                    error=1, ready=0)
        should_continue = set_state_to_trained(model_holder)
        if should_continue:
            return

    except Exception as e:
        logger.error(f'error occurred in pv prediction thread: {repr(e)}')
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(model_holder, model_store=is_model_updated_in_prediction(model_holder),
                                                 common_status_store=True, specific_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder, df
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def pv_monitoring_service_prediction_thread(
        model_id: str, _: typing.Type[PvMonitoringServiceModelHolder]) -> None:
    """compute pv monitoring service predictions"""

    logger = logging.getLogger('pv_monitoring_service_prediction')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = PvMonitoringServiceModelHolder.load_model_holder_from_s3(
        model_id)

    try:
        ts0 = datetime.datetime.now()
        ts_start = int((ts0 - datetime.timedelta(days=1)).replace(second=0,
                                                                  microsecond=0, hour=0, minute=0).timestamp())
        ts_end = int(ts0.replace(hour=0, minute=0,
                                 second=0, microsecond=0).timestamp())
        current_day = datetime.datetime.now().day

        should_continue = check_controller_state(model_holder)
        if should_continue:
            return
        try:
            df = model_holder.get_dh().get_data(ts_start, ts_end)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) getting data from http: " + str(e))
            return
        try:
            df = preprocess_pv_monitoring_service_data(df)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) processing data: " + str(e))
            return
        try:
            yearly_decay = fetch_last_value(
                model_holder.get_decay(), model_holder.get_project_id())
        except ValueError:
            yearly_decay = 0
        except Exception as e:
            model_holder.set_status(
                status="(fetch decay) model prediction: " + str(e), error=2, ready=0)
            return
        try:
            efficiency = model_holder.get_model().predict(df, yearly_decay)
            count = 0
            for e in efficiency:
                if e > 90:
                    count += 1

            if count < 2:
                efficiency = efficiency[-1]
            else:
                efficiency = 0

            model_holder.update_efficiency(efficiency, current_day)

        except Exception as e:
            model_holder.set_status(
                status="(error prediction) model prediction: " + str(e), error=2, ready=0)
            return
        should_continue = set_state_to_trained(model_holder)
        if should_continue:
            return
    except Exception as e:
        logger.error(f'error occurred in pv monitoring thread: {repr(e)}')
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(model_holder, model_store=is_model_updated_in_prediction(model_holder),
                                                 common_status_store=True, specific_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder, df
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def load_monitor_prediction_thread(
        model_id: str, _: typing.Type[LoadMonitorModelHolder]) -> None:
    """compute load periods"""

    logger = logging.getLogger('load_monitor_prediction')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = LoadMonitorModelHolder.load_model_holder_from_s3(
        model_id)

    try:
        ts0 = datetime.datetime.now()
        ts_start = int(
            (ts0 - datetime.timedelta(minutes=2*model_holder.get_window_size())).timestamp())
        ts_end = int(ts0.timestamp())

        should_continue = check_controller_state(model_holder)
        if should_continue:
            return
        try:
            df = model_holder.get_dh().get_data(ts_start, ts_end)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) getting data from http: " + str(e))
            return
        try:
            x = preprocess_load_monitor_data(
                df, model_holder.get_model())[-1][0]
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) processing data: " + str(e))
            return
        try:
            load = model_holder.get_model().predict(x)
            model_holder.update_load(load)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) model prediction: " + str(e), error=2, ready=0)
            return
        should_continue = set_state_to_trained(model_holder)
        if should_continue:
            return
    except Exception as e:
        logger.error(f'error occurred in load monitoring thread: {repr(e)}')
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(model_holder, model_store=is_model_updated_in_prediction(model_holder),
                                                 common_status_store=True, specific_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder, df
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())

def consumption_service_prediction_thread(
        model_id: str, _: typing.Type[ConsumptionServiceModelHolder]) -> None:
    """compute consumption service predictions"""

    logger = logging.getLogger('consumption_service_prediction')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = ConsumptionServiceModelHolder.load_model_holder_from_s3(
        model_id)

    try:
        ts_start, ts_end, tsd0, should_continue = prepare_timestamps()

        should_continue = check_controller_state(model_holder)
        if should_continue:
            return
        try:
            df = model_holder.get_dh().get_data(ts_start, ts_end, True)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) getting data from http: " + str(e))
            return
        try:
            df = preprocess_pv_production_consumption_service_data(df)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) processing data: " + str(e))
            return
        try:
            if model_holder.get_data_type() == 0:
                x, _ = get_pv_production_consumption_service_features(df, [15, 30, 45, 60], [
                    15, 30, 45, 60], 15)
            else:
                x, _ = get_pv_production_consumption_service_features(df, lag_steps=[15, 30, 45, 60],
                                                                      prediction_steps=[
                                                                          15, 30, 45, 60],
                                                                      time_resolution=15, lag_label=[15])
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) feature processing data: " + str(e))
            return
        x, should_continue = extract_daily_data(x, tsd0, model_holder)
        if should_continue:
            return
        try:
            pv, en = model_holder.get_model().predict(
                x, recursive=model_holder.get_data_type() != 0)
            model_holder.set_predictions(pv, en)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) model prediction: " + str(e), error=2, ready=0)
            return
        try:
            model_holder.set_daily_energy(calculate_energy_of_day(
                model_holder.get_power_variable(), model_holder.get_project_id(), False))
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) energy calculation: " + str(e), error=1, ready=0)
        should_continue = set_state_to_trained(model_holder)
        if should_continue:
            return

    except Exception as e:
        logger.error(f'error during consumption prediction: {repr(e)}')
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(model_holder, model_store=is_model_updated_in_prediction(model_holder),
                                                 common_status_store=True, specific_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder, df
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def setpoint_optimizer_prediction_thread(
        model_id: str, _: typing.Type[SetpointOptimizerModelHolder]) -> None:
    """compute setpoint optimizer predictions"""

    logger = logging.getLogger('setpoint_optimizer')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = SetpointOptimizerModelHolder.load_model_holder_from_s3(
        model_id)

    try:
        try:
            # wait for the model to be trained
            if model_holder.get_ready_from_state() == 0:
                logger.debug("model state is 0")
                return

            # update step here is only needed for the old generation of the setpoint optimizer
            if not model_holder.is_setpoint_optimizer_next_generation():
                # check if the setpoint optimizer needs to be evaluated and its parameters adjusted
                if model_holder.get_next_update_date() is None:
                    model_holder.set_next_update_date(int(
                        (datetime.datetime.now() + datetime.timedelta(days=1)).timestamp()))
                    model_holder.set_curve_params(
                        model_holder.get_curve_params(state=True))
                elif model_holder.get_next_update_date() < int(datetime.datetime.now().timestamp()):
                    params, updated_model = SetpointOptimizerModel.update_setpoint_optimizer(
                        model_holder.get_dh(), model_holder.get_model(), model_holder.get_model_id())
                    model_holder.set_model(updated_model)
                    model_holder.set_curve_params(params)
                    model_holder.set_next_update_date(int(
                        (datetime.datetime.now() + datetime.timedelta(days=1)).timestamp()))
                else:
                    params, updated_model = SetpointOptimizerModel.update_setpoint_optimizer(
                        model_holder.get_dh(), model_holder.get_model(), model_holder.get_model_id())
                    model_holder.set_model(updated_model)
                    model_holder.set_curve_params(params)
                    model_holder.set_next_update_date(int(
                        (datetime.datetime.now() + datetime.timedelta(days=1)).timestamp()))
            else:
                # the new generation of the setpoint optimizer is only trained in the predict method
                pass

            # compute the start and end timestamps
            current_unix_timestamp = time.time()
            # a quarter of a day backwards
            ts_start = int(current_unix_timestamp - 86400 / 4)
            ts_end = int(current_unix_timestamp)

            # set the time range in the status
            model_holder.set_start_and_end_timestamp(ts_start, ts_end)

            # get the required data from the systems and preprocess it
            try:
                df = model_holder.get_dh().get_data(ts_start, ts_end, prediction=True)
            except Exception as e:
                logger.error(f"Dataframe error: {traceback.format_exc()}")
                model_holder.set_status(status=str(e))
                return

            df = preprocess_setpoint_optimizer_data(
                df, model_holder.get_dh().is_setpoint_optimizer_top())

            # fetch the settings for every temperature control system
            min_temp = {}
            max_temp = {}
            setpoints = {}
            setpoints_low = {}
            operation_type = {}
            schedules = {}
            timezones = {}
            for key, systems in model_holder.get_dh().__dict__.items():

                if "_systems" not in key:
                    continue
                if not systems:
                    continue
                for system in systems:
                    min_temp[system.identifier] = system.min_flow_temperature
                    max_temp[system.identifier] = system.max_flow_temperature
                    if system.weekly_schedule_active:
                        date = datetime.datetime.now(
                            tz=pytz.timezone(system.timezone))
                        day = date.date().strftime("%A").lower()
                        setpoints[system.identifier] = system.weekly_schedule[day]["high_setpoint"]
                        setpoints_low[system.identifier] = system.weekly_schedule[day]["low_setpoint"]
                        schedules[system.identifier] = {
                            "start": system.weekly_schedule[day]["start"],
                            "end": system.weekly_schedule[day]["end"]
                        }
                    else:
                        setpoints[system.identifier] = system.set_point_temperature
                        setpoints_low[system.identifier] = system.set_point_temperature
                    operation_type[system.identifier] = system.status
                    timezones[system.identifier] = system.timezone

            # complete the optimization step with the fetched data and the prediction call
            try:
                y, system_states = model_holder.get_model().predict(
                    df, min_temp, max_temp, setpoints, setpoints_low, operation_type, schedules, timezones)
                for key, systems in model_holder.get_dh().__dict__.items():
                    if "_system" not in key:
                        continue
                    if not systems:
                        continue
                    if "heating_water" not in key:
                        continue
                    measurements = {}
                    for system in systems:
                        name = system.on_off_state
                        value = system_states[system.identifier][0]
                        project_id = system_states[system.identifier][1]
                        if name == "":
                            continue
                        if project_id not in measurements.keys():
                            measurements[project_id] = []
                        measurements[project_id].append(
                            {
                                "n": name,
                                "v": value
                            }
                        )
                    if measurements:
                        logger.info(
                            f"setpoint optimizer measurements: {measurements}")
                        turn_off_system(measurements)
            except Exception as e:
                error_message = f"setpoint optimizer prediction error: {repr(e)} {traceback.format_exc()}"
                logger.error(error_message)
                model_holder.set_status(status=error_message)
                return

            # set the current setpoint temperature
            most_recent_timestamp_index = get_most_recent_timestamp_from_df(
                df, return_int_index=True)
            model_holder.update_setpoint_temperature(
                y, most_recent_timestamp_index)

            # set the model as fully running
            model_holder.set_status(ready=2)
        except Exception as e:
            model_holder.set_status(status=str(e))
            return
    except Exception as e:
        logger.error(
            f'error in setpoint optimizer thread: {repr(e)} {traceback.format_exc()}')
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(model_holder, model_store=is_model_updated_in_prediction(model_holder),
                                                 common_status_store=True, specific_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder, df
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def ems_prediction_thread(
        model_id: str, _: typing.Type[EmsModelHolder]) -> None:
    """compute ems predictions"""

    logger = logging.getLogger('ems_prediction')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = EmsModelHolder.load_model_holder_from_s3(model_id)

    try:
        ts0 = datetime.datetime.now()
        ts_start = int(ts0.timestamp() - 86400 * 3)
        ts_end = int(ts0.timestamp())
        tsd0 = ts0.replace(second=0, microsecond=0).astimezone(
            pytz.timezone("CET"))
        tsd0 = tsd0 - pd.to_timedelta(ts0.minute % 15, 'min')

        df, should_continue = check_state_and_fetch_data(
            model_holder, ts_start, ts_end)
        if should_continue:
            logger.debug("model holder not ready")
            return
        try:
            df = preprocess_ems_data(df, 15, True)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) processing data: " + str(e))
            return

        # ---------------- make forecast --------------------
        try:
            # get the features and the recursive labels
            x, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _, recursive = get_ems_features(df,
                                                                                            [15, 30,
                                                                                                45, 60],
                                                                                            [15, 30,
                                                                                                45, 60],
                                                                                            15, [15])
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) feature processing data: " + str(e))
            return
        try:
            x = x.loc[tsd0:tsd0 + pd.to_timedelta(24, "hour")]
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) indexing data: " + str(e))
            return
        try:
            (y_consumption,
             y_pv,
             y_generator,
             y_grid,
             y_battery,  # Leistung = Power = kW
             y_charge,
             y_house,
             y_electric,
             y_pump,
             y_consumer,
             y_soc,  # State of Charge = %
             y_tpow_battery,
             y_tpow_charge,
             y_tpow_electric,
             y_tpow_pump,
             y_tpow_consumer) = \
                model_holder.get_model().predict(x, recursive)

        except Exception as e:
            model_holder.set_status(
                status="(error prediction) model prediction: " + str(e) + "x.columns: " + str(x.columns), error=2)
            return

        # ----------------------- Fake low activity devices ------------------------------

        fake_it_devices = {"charge_station": y_charge,
                           "electric_heating": y_electric}

        def fake_it(df, key, device, y_consumption):
            ''' Function to copy the last 24h of a device in the forecast'''
            for i, _ in enumerate(device):
                y_consumption -= device[i]
                device[i] = df[f'{key}{i+1}_power'][0:len(device[i])].values
                y_consumption += device[i]
            return device, y_consumption

        for key, device in fake_it_devices.items():
            if not device:
                continue
            device, y_consumption = fake_it(df, key, device, y_consumption)


        # ----------------------- Set Mode ------------------------------
        # mode  = 1:                        (Eigenverbrauch) discharge if PV not enough, load if PV overproduction
        # mode != 1 + charge from grid:     (Lastspitzenkappung) loading whenever possible, discharge only when grid not enough
        # mode != 1 + not charge from grid: (Lastspitzenkappung PV) load only when PV overproduction, discharge only when grid not enough

        try:
            # Consumption that is not covered by PV
            con = (y_consumption - sum(y_pv)).copy()

            mode = fetch_last_value(
                model_holder.get_operation_mode(), model_holder.get_project_id())

            # depending on the operation mode, the model will not control the consumption to 0 but to an offset
            if mode == 1:
                # battery loading     -> con < 0
                # battery discharging -> con > 0
                off1 = 0
                off2 = 0
            else:
                grid_size = fetch_last_value(
                    model_holder.get_grid_component().size[0], model_holder.get_project_id()) * 0.95

                enable_charging_from_grid = fetch_last_value(model_holder.get_allow_charging_state_variable(),
                                                             model_holder.get_project_id())
                if enable_charging_from_grid == 1:
                    # battery loading     -> con < grid_size
                    # battery discharging -> con > grid_size
                    off1 = -grid_size
                    off2 = -grid_size
                else:
                    # battery loading     -> con < 0
                    # battery discharging -> con > grid_size
                    off1 = 0
                    off2 = -grid_size
        except Exception as e:
            logging.error(
                "(error prediction) calculating consumption: " + str(e))
            model_holder.set_status(
                status="(error prediction) calculating consumption in set mode", error=2)
            return

        # ------------------Calc Battery Capacities--------------------
        try:
            if model_holder.has_battery():

                # Max Capacity (constant)
                max_cap = model_holder.get_battery_component().get_max_cap(
                    model_holder.get_project_id())

                # cap = current Battery Capacitiy which was not set right thus the soc was used to calc cap.
                # cap = model_holder.get_battery_component().get_cap(model_holder.get_project_id())
                soc = model_holder.get_battery_component().get_latest_soc(
                    model_holder.get_project_id())

                cap = max_cap*soc/100

                # Minimum Reserve Capacity in % (constant)
                min_reserve = model_holder.get_battery_min_reserve()

                # Reserve Cap in kW
                reserve_capacity = max_cap * min_reserve / 100

                # New capacity based on min reserve
                cap = cap - reserve_capacity

                if cap < 0:
                    cap = 0
            else:
                max_cap = 0
                reserve_capacity = 0
                cap = 0
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) calculating capacity: " + str(e), error=2)
            return

        # ------------------Calc Battery Loading Phases--------------------
        # con -> consumption not covered by PV
        # off1 -> Battery charging offset depending on mode
        #
        # result: start_loading, end_loading arrays

        try:
            if model_holder.has_battery():
                start_loading, end_loading = calculate_loading_phase(
                    con, offset=off1)
            else:
                start_loading, end_loading = [], []
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) calculating loading phases " + str(e), error=2)
            return

        # ------------------Calc TODO document--------------------

        try:
            # the current capacity of the battery is needed for the control step
            capacities = calculate_capacities(con, start_loading, end_loading, cap, max_cap,
                                              model_holder.get_max_charge(), reserve_capacity, offset=off1)
            reference_capacity = 0
            for c in capacities:
                reference_capacity += c[0]

            if reference_capacity > (max_cap - reserve_capacity) * 0.6:
                model_holder.set_winter_mode(0)
            elif reference_capacity > (max_cap - reserve_capacity) * 0.4:
                model_holder.set_winter_mode(1)
            else:
                model_holder.set_winter_mode(2)

        except Exception as e:
            model_holder.set_status(
                status="(error prediction) calculating capacity: " + str(e), error=2)
            return

        # ----------------------- get energy price -------------------------

        try:
            # depending on the operation mode, the energy price also influences the control step
            price = get_prices(model_holder.get_energy_price(),
                               x, mode=model_holder.get_mode())
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) calculating prices: " + str(e), error=2)
            return

        # ------------------- format grid to fit optimization -------------------------
        try:
            # the grid power has to be formatted to a matrix for the convex optimization
            grid, weights = format_grid_for_optimization(
                con, start_loading, end_loading, price)

            if model_holder.get_winter_mode() != 0:
                for i in range(grid.shape[1]):
                    grid[(int(len(grid[:, i]) / 2)):, i] = 0

        except Exception as e:
            model_holder.set_status(
                status="(error prediction) grid calculation: " + str(e), error=2)
            return

        # ------------------- optimize Battery power -------------------------------
        # grid
        # capacities
        # start/end loading
        # weights -> depending on price
        # off2 -> battery discharge offset
        #
        # result: battery_power (bat_power)

        try:
            if not capacities:
                capacities = [[0, True]]
            bat_power = optimize_battery_power(grid, len(capacities), capacities,
                                               start_loading, end_loading, weights, offset=off2)
        except Exception as e:
            model_holder.set_status(status=f"(error optimization) {e} \n "
                                           f"capacities: {capacities} \n "
                                           f"grid: {grid} \n"
                                           f"start_loading: {start_loading} \n"
                                           f"end_loading: {end_loading} \n"
                                           f"weights: {weights} \n"
                                           f"off: {off2}")
            return

        # ------------------- Add Toleranz to strategy -------------------------------
        try:
            # the newly calculated battery strategy needs some tolerance, because of a general model
            # and weather forecast error
            include_last = True
            if model_holder.has_battery():
                if (cap / (max_cap - reserve_capacity)) < 0.3:
                    model_holder.set_enable_controlling(int(
                        (sum((con[:-1] + off2) * ((con[:-1] + off2) > 0) - bat_power) * 0.25) < (
                            1)))
                else:
                    if start_loading:
                        if start_loading[0] == 0:
                            model_holder.set_enable_controlling(1)
                    elif len(capacities) > 1:
                        if capacities[1][1]:
                            model_holder.set_enable_controlling(int(
                                (sum(((con[:-1] + off2) * ((con[:-1] + off2) > 0) - bat_power)[
                                     :end_loading[0]]) * 0.25) < (
                                    1 + model_holder.get_model_error() * 2)))
                        else:
                            model_holder.set_enable_controlling(int(
                                (sum((con[:-1] + off2) * ((con[:-1] + off2) > 0) - bat_power) * 0.25) < (
                                    1 + model_holder.get_model_error() * 2)))
                    else:
                        model_holder.set_enable_controlling(int(
                            (sum((con[:-1] + off2) * ((con[:-1] + off2) > 0) - bat_power) * 0.25) < (
                                1 + model_holder.get_model_error() * 2)))

                if len(y_battery) == 1:
                    y_battery[0], y_soc[0], _ = calculate_battery_prediction(con=con,
                                                                             max_charge=model_holder.get_max_charge(),
                                                                             current_cap=cap + reserve_capacity,
                                                                             reserve_cap=reserve_capacity,
                                                                             max_cap=max_cap,
                                                                             pos_bat_pow=bat_power.copy(),
                                                                             offset=off1)

                    y_grid[0] = con[:-1] - y_battery[0]
                else:
                    include_last = False

                if bat_power[0] < (abs(model_holder.get_max_charge()) * 0.5):
                    if (cap / (max_cap - reserve_capacity)) > 0.7:
                        bat_power[0] += model_holder.get_model_error() * 1.25
                    elif (cap / (max_cap - reserve_capacity)) > 0.5:
                        bat_power[0] += model_holder.get_model_error()
                    elif (cap / (max_cap - reserve_capacity)) > 0.3:
                        bat_power[0] += model_holder.get_model_error() * 0.5
                    else:
                        bat_power[0] -= model_holder.get_model_error() * 0.1
                        if bat_power[0] < 0:
                            bat_power[0] = 0
            else:
                # if no battery, consumption that is not covered by PV has to be covered by the grid
                y_grid[0] = con[:-1]

            # -------------- correct sum of consumers to align with y_consumption ---------------------------
            consumers = [y_house, y_charge, y_electric, y_pump, y_consumer]

            y_house, y_charge, y_electric, y_pump, y_consumer = consumer_correction(
                consumers, y_consumption)

            # Make final check
            y_grid_check = y_grid.copy()
            y_grid_check[0] = np.append(y_grid_check[0], 0)

            if model_holder.has_battery():
                y_battery_check = y_battery.copy()
                y_battery_check[0] = np.append(y_battery_check[0], 0)
            else:
                y_battery_check = []

            generators = [y_pv, y_generator, y_grid_check, y_pump]

            sum_consumers = get_devices_sum(consumers, len(y_consumption))
            sum_generators = get_devices_sum(generators, len(y_consumption))

            if sum((sum_generators - sum_consumers + sum(y_battery_check))[:-1]) > 0.001:
                logger.warning(f'EMS Forecast sum > 0.001!')

            # ------------------- store results ---------------------------
            model_holder.set_predictions_in_status(bat_power,
                                                   y_consumption)

            model_holder.assign_results(y_pv,  # 7x97
                                        y_generator,
                                        y_grid,  # 96
                                        y_battery,
                                        y_charge,
                                        y_house,
                                        y_electric,
                                        y_pump,
                                        y_consumer,
                                        y_soc,
                                        y_tpow_battery,
                                        y_tpow_charge,
                                        y_tpow_electric,
                                        y_tpow_pump,
                                        y_tpow_consumer,
                                        include_last)

        except Exception as e:
            model_holder.set_status(
                status="(error prediction) model prediction: " + str(e), error=2, ready=0)
            return
        try:
            model_holder.set_status(error=0, ready=2)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) indexing states: " + str(e), error=2, ready=0)
            return
    except Exception as e:
        logger.error(f'error occurred in ems prediction thread: {repr(e)}')
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(model_holder, model_store=is_model_updated_in_prediction(model_holder),
                                                 common_status_store=True, specific_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder, df
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def activate_heating_pumps_for_ems_thread(
        model_id: str, _: typing.Type[EmsModelHolder]) -> None:
    """handles the heating pump activation for the ems models"""

    logger = logging.getLogger('activate_heating_pumps')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = EmsModelHolder.load_model_holder_from_s3(
        model_id, model_load=False)

    try:
        logging.info("starting activate heating pump thread ...")
        list_of_models_to_activate = []
        try:

            logger.debug(
                f"ready for model {model_holder.get_model_id()}: {model_holder.get_ready_from_state()}")

            if model_holder.get_ready_from_state() == 0:
                logger.debug("model state is 0")
                return

            # if there is no information about the energy price, the heating pump optimization can not be done
            if model_holder.get_energy_price() == {}:
                logger.debug(
                    "no information about energy price, skipping heating pump optimization")
                return

            if not "timezone" in model_holder.get_energy_price().keys():
                logger.info(
                    "No timezone in energy price info. Setting to standard Europe/Vienna")
                tz = pytz.timezone('Europe/Vienna')
            else:
                tz = pytz.timezone(
                    model_holder.get_energy_price()["timezone"].replace("\\", ""))

            if model_holder.get_next_optimization_day() is not None:
                if model_holder.get_next_optimization_day() > datetime.datetime.now(tz=tz):
                    return

            # currently only one heating pump can be controlled
            if len(model_holder.get_heating_pump_component().name) != 1:
                return

            # if there is no information about the max power of the heating pump,
            # the control step cannot be done
            if len(model_holder.get_heating_pump_component().max_power[0]) == 0:
                return

            # for the control step, information about the energy price needs to be extracted
            (start_low_hour, end_low_hour, start_high_hour, end_high_hour,
             start_low_min, end_low_min, start_high_min, end_high_min) = get_energy_price_time(
                model_holder.get_energy_price())

            # set a default value for next optimization day
            next_optimization_day = datetime.datetime.now(tz=tz).replace(hour=start_low_hour,
                                                                         minute=start_low_min,
                                                                         second=0,
                                                                         microsecond=0)

            # the control step depends on whether the low phase is from time x to time y if time x > time y
            # since that means the low phase goes till the next day
            if start_low_hour != end_low_hour:
                current_hour = datetime.datetime.now().hour
                current_minute = datetime.datetime.now().minute
                if start_low_hour > end_low_hour:
                    # only optimize if currently in the low phase
                    optimize = (start_low_hour < current_hour) or \
                               (end_low_hour > current_hour) or \
                               ((start_low_hour == current_hour) and (start_low_min < current_minute)) or \
                               ((end_low_hour == current_hour) and (
                                   end_low_min > current_minute))

                    if optimize:
                        # put the date when the next optimization will be calculated
                        if start_low_hour <= current_hour:
                            next_optimization_day = datetime.datetime.now(tz=tz).replace(hour=start_low_hour,
                                                                                         minute=start_low_min,
                                                                                         second=0,
                                                                                         microsecond=0) + \
                                datetime.timedelta(days=1)
                        elif end_low_hour >= current_hour:
                            next_optimization_day = datetime.datetime.now(tz=tz).replace(hour=start_low_hour,
                                                                                         minute=start_low_min,
                                                                                         second=0,
                                                                                         microsecond=0)
                else:
                    optimize = (start_low_hour < current_hour < end_low_hour) or \
                               ((start_low_hour == current_hour) and (start_low_min < current_minute)) or \
                               ((end_low_hour == current_hour) and (
                                   end_low_min > current_minute))
                    if optimize:
                        next_optimization_day = datetime.datetime.now(tz=tz).replace(hour=start_low_hour,
                                                                                     minute=start_low_min,
                                                                                     second=0,
                                                                                     microsecond=0) + \
                            datetime.timedelta(days=1)
                if optimize:
                    mp = [
                        v for v in model_holder.get_heating_pump_component().max_power[0].values()]
                    linear_pump = True
                    # fetch the max power of the heating pump
                    if len(mp) == 1:
                        heating_pump_power = fetch_last_value(
                            mp[0], model_holder.get_project_id())
                    else:
                        hpp1 = fetch_last_value(
                            mp[0], model_holder.get_project_id())
                        hpp2 = fetch_last_value(
                            mp[1], model_holder.get_project_id())
                        if hpp1 == 0:
                            heating_pump_power = hpp2
                        elif hpp2 == 0:
                            heating_pump_power = hpp1
                        else:
                            linear_pump = False
                            heating_pump_power = hpp1 + hpp2

                    pv = np.zeros(96)
                    battery = np.zeros(96)

                    # get the prediction of the ems model

                    for k, p in model_holder.get_predicted_power().items():
                        if "pv" in k:
                            pv += p
                        elif "battery" in k:
                            battery += p
                        else:
                            continue

                    battery = battery * (battery < 0)

                    power = pv + battery
                    activate_heating_pump_in_low_mode = True

                    # calculate if there is enough power to activate the heating pump later

                    if not linear_pump:
                        for i in range(len(power) - 4):
                            if np.all(power[i:i + 4] >= heating_pump_power):
                                activate_heating_pump_in_low_mode = False
                    else:
                        total_available_power = 0
                        for i in range(len(power)):
                            if power[i] > 0:
                                if power[i] >= heating_pump_power:
                                    total_available_power += heating_pump_power
                                else:
                                    total_available_power += power[i]

                        if total_available_power >= heating_pump_power * 4:
                            activate_heating_pump_in_low_mode = False

                    if activate_heating_pump_in_low_mode:
                        list_of_models_to_activate.append([model_holder.get_project_id(),
                                                           model_holder.get_activate_heating_pump_variable()])

                    model_holder.set_next_optimization_day(
                        next_optimization_day)
                else:
                    return
        except Exception as e:
            logger.error(
                f"error in heating pump thread for model {model_holder.get_model_id()}: "
                f"{repr(e)} {traceback.format_exc()}")
            return

        logger.info(
            f"publishing heating pump messages: {list_of_models_to_activate}")
        publish_heating_pumps(list_of_models_to_activate)
    except Exception as e:
        logger.error(f"error in heating pump thread: {repr(e)}")
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(model_holder, model_store=is_model_updated_in_prediction(model_holder),
                                                 common_status_store=True, specific_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def history_anomaly_detection_prediction_thread(
        model_id: str, _: typing.Type[HistoryAnomalyDetectionModelHolder]) -> None:
    """compute history anomaly detection predictions"""

    logger = logging.getLogger('history_anomaly_detection')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = HistoryAnomalyDetectionModelHolder.load_model_holder_from_s3(
        model_id)

    try:
        ts0 = datetime.datetime.now()
        # Assumes minutes intervals
        ts_start = int(ts0.timestamp() -
                       model_holder._model.shingle_size * 4 * 60)
        ts_end = int(ts0.timestamp())

        x, should_continue = get_stream_history_anomaly_detection_features_with_error_handling(model_holder, ts_start,
                                                                                               ts_end)
        if should_continue:
            logger.debug("model holder not ready")
            return
        try:
            # score gets calculated without updating the forest
            score = model_holder.get_anomaly_score(x)
            model_holder.set_anomaly_score(score)
            model_holder.set_status(ready=2)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) anomaly score: " + str(e))
            return
    except Exception as e:
        logger.error(f'error occurred in history anomaly thread: {repr(e)}')
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(model_holder,
                                                 model_store=is_model_updated_in_prediction(
                                                     model_holder),
                                                 common_status_store=True,
                                                 specific_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def stream_anomaly_detection_prediction_thread(
        model_id: str, _: typing.Type[StreamAnomalyDetectionModelHolder]) -> None:
    """compute stream anomaly detection predictions"""

    logger = logging.getLogger('stream_anomaly_detection')
    logger.debug("starting thread with pid: %d", os.getpid())

    model_holder = StreamAnomalyDetectionModelHolder.load_model_holder_from_s3(
        model_id)

    try:
        ts0 = datetime.datetime.now()
        # Assumes minutes intervals
        ts_start = int(ts0.timestamp() -
                       model_holder._model.shingle_size * 4 * 60)
        ts_end = int(ts0.timestamp())

        x, should_continue = get_stream_history_anomaly_detection_features_with_error_handling(model_holder, ts_start,
                                                                                               ts_end)
        if should_continue:
            return
        try:
            # get the score and update the tree
            score = model_holder.get_anomaly_score(x)
            model_holder.insert_point(x)
            model_holder.set_anomaly_score(score)
            model_holder.set_status(ready=2)
        except Exception as e:
            model_holder.set_status(
                status="(error prediction) anomaly score: " + str(e))
            return
    except Exception as e:
        logger.error(f'error occurred in stream anomaly thread: {repr(e)}')
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(model_holder, model_store=is_model_updated_in_prediction(model_holder),
                                                 common_status_store=True, specific_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def train_model_thread(model_id: str, model_holder_type: typing.Type[ModelHolder],
                       retrain_model: bool = False) -> None:
    """train a newly created model and set the status accordingly"""

    logger = logging.getLogger('train_model')
    logger.debug("starting train model thread with pid: %d", os.getpid())

    model_holder = ModelHolder.load_model_holder_from_s3(
        model_id, model_holder_type, model_load=False)

    # do not retrain already trained models that are updated during the prediction to keep the state
    if is_model_updated_in_prediction(model_holder) and model_holder.get_ready_from_state() == 2:
        return

    try:
        logger.debug("start training model with id: %s",
                     model_holder.get_model_id())
        train_model(model_holder, retrain_model)
    except ValueError as e:
        model_holder.set_status(
            status=f"error training: {repr(e)}", error=1, training=False)
        logger.warning("error training model with id %s: %s",
                       model_holder.get_model_id(), e)
        return
    except Exception as e:
        model_holder.set_status(
            status=f"error training: {repr(e)}", error=2, training=False)
        logger.warning("error training model with id %s: %s",
                       model_holder.get_model_id(), e)
        return
    finally:
        try:
            ModelHolder.store_model_holder_to_s3(
                model_holder, model_store=True, common_status_store=True)
        except Exception as e:
            logger.warning(f'error storing model holder: {repr(e)}')
        try:
            del model_holder
        except Exception:
            pass
        logger.debug("thread with pid %d done", os.getpid())


def report_memory_usage_thread(main_process_pid: int) -> None:
    """log memory usage"""

    current_memory_info = get_current_memory_info(main_process_pid)
    logging.info(f"current memory info: {current_memory_info}")


def logging_listener_thread(
        queue: multiprocessing.Queue,
        log_file_path: str | None,
        log_level: int,
        check_interval_seconds: int = 1) -> None:
    """log consumption thread for multiprocessing"""

    configure_logging_listener(log_file_path, log_level)
    while True:
        while not queue.empty():
            record = queue.get()
            logger = logging.getLogger(record.name)
            logger.handle(record)
        time.sleep(check_interval_seconds)


def train_model_queue_listener_thread(
        queue: multiprocessing.Queue,
        check_interval_seconds: int = 1) -> None:
    """log consumption thread for multiprocessing"""

    while True:
        while not queue.empty():
            train_args = queue.get()
            start_process(target=train_model_thread,
                          args=train_args)
        time.sleep(check_interval_seconds)
