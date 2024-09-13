import collections.abc
import datetime
import gc
import threading
import time
import tracemalloc

import pandas as pd
import pytz

from ai.interface.model_holder import ModelHolder
from ai.model_holder.ems_model_holder import EmsModelHolder
from ai.model_holder.history_anomaly_detection_model_holder import HistoryAnomalyDetectionModelHolder
from ai.model_holder.pv_production_service_model_holder import PvProductionServiceModelHolder
from ai.model_holder.stream_anomaly_detection_model_holder import StreamAnomalyDetectionModelHolder
from ai.preprocessing.stream_history_anomaly_detection_preprocessing import (
    get_stream_history_anomaly_detection_features,
    preprocess_stream_history_anomaly_detection_data)


def start_thread(target: collections.abc.Callable, args: tuple[object, ...] = ()) -> None:
    """start a thread with the passed arguments"""

    thread = threading.Thread(target=target, args=args)
    thread.start()


def periodically_run_garbage_collector(interval_seconds: int = 15) -> None:
    """periodically delete dangling objects"""

    while True:
        time.sleep(interval_seconds)
        gc.collect()


def start_garbage_collector_thread() -> None:
    """periodically delete dangling objects in a background thread"""

    start_thread(target=periodically_run_garbage_collector)


def periodically_log_recorded_allocations(interval_seconds: int = 60, frames: int = 100,
                                          allocations: int = 10, cumulative: bool = True) -> None:
    """periodically log recorded allocations to a file"""

    tracemalloc.start(frames)
    while True:
        time.sleep(interval_seconds)
        with open(f'allocations_{int(time.time())}.log', 'w') as file:
            snapshot = tracemalloc.take_snapshot()
            file.write(f'########## Memory Statistics ##########\n')
            for statistic_type, header in (('lineno', 'Files'), ('traceback', 'Tracebacks')):
                stats = snapshot.statistics(
                    statistic_type, cumulative if statistic_type != 'traceback' else False)
                top_stats = stats[:allocations]
                file.write(f'***** {header} Top {len(top_stats)} *****\n')
                for stat in top_stats:
                    file.write(
                        f'--- {stat.size / 1_000_000} total megabytes, {stat.count} memory blocks ---\n')
                    for line in stat.traceback.format(most_recent_first=True):
                        file.write(f'# {line} #\n')


def start_allocation_log_thread() -> None:
    """periodically log recorded allocations to a file in a background thread"""

    start_thread(target=periodically_log_recorded_allocations)


def get_stream_history_anomaly_detection_features_with_error_handling(
        model_holder: StreamAnomalyDetectionModelHolder | HistoryAnomalyDetectionModelHolder,
        ts_start: int, ts_end: int, add_minute_of_day:bool=True) -> tuple[float, bool]:
    """helper function for the anomaly detection threads"""

    controller_not_ready = check_controller_state(model_holder)
    if controller_not_ready:
        return 0, True
    try:
        df = model_holder.get_dh().get_data(ts_start, ts_end, add_minute_of_day)
    except Exception as e:
        model_holder.set_status(status="(error prediction) getting data from http: " + str(e))
        return 0, True
    try:
        df = preprocess_stream_history_anomaly_detection_data(df)
    except Exception as e:
        model_holder.set_status(status="(error prediction) processing data: " + str(e))
        return 0, True
    try:
        # only the last point gets calculated
        x = get_stream_history_anomaly_detection_features(df, model_holder._model.shingle_size)
        x = x[-1]
    except Exception as e:
        model_holder.set_status(status="(error prediction) features: " + str(e))
        return 0, True
    return x, False


def set_state_to_trained(model_holder: ModelHolder) -> bool:
    """set model state to trained"""

    try:
        model_holder.set_status(ready=2)
    except Exception as e:
        model_holder.set_status(status="(error prediction) indexing states: " + str(e), error=2, ready=0)
        return True
    return False


def prepare_timestamps() -> tuple[int, int, datetime.datetime, bool]:
    """helper function for some threads"""

    ts0 = datetime.datetime.now()
    ts_start = int(ts0.timestamp() - 86400)
    ts_end = int(ts0.timestamp())
    tsd0 = ts0.replace(second=0, microsecond=0).astimezone(
        pytz.timezone("CET"))
    tsd0 = tsd0 - pd.to_timedelta(ts0.minute % 15, 'min')
    return ts_start, ts_end, tsd0, False


def extract_daily_data(x: pd.DataFrame, tsd0: datetime.datetime, model_holder: ModelHolder):
    """extract daily data out of the dataframe"""

    try:
        x = x.loc[tsd0:tsd0 + pd.to_timedelta(24, "hour")]
    except Exception as e:
        model_holder.set_status(status="(error prediction) indexing data: " + str(e))
        return pd.DataFrame(), True
    return x, False


def check_state_and_fetch_data(model_holder: PvProductionServiceModelHolder | EmsModelHolder, ts_start: int,
                               ts_end: int) -> tuple[pd.DataFrame, bool]:
    """check controller and fetch data from data holder"""

    controller_not_ready = check_controller_state(model_holder)
    if controller_not_ready:
        return pd.DataFrame(), True
    try:
        df = model_holder.get_dh().get_data(ts_start, ts_end, True)
    except Exception as e:
        model_holder.set_status(status="(error prediction) getting data from http: " + str(e))
        return pd.DataFrame(), True
    return df, False


def check_controller_state(model_holder: ModelHolder) -> bool:
    """check if controller state is ready"""

    try:
        # if the controller is not ready, the prediction will not be calculated
        if model_holder.get_ready_from_state() == 0:
            return True
    except Exception as e:
        model_holder.set_status(status="(error prediction) error when checking ready: " + str(e), error=2, ready=1)
        return True
    return False
