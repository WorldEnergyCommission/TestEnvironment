import datetime
import logging
import os
from typing import Tuple
from sklearn import svm
import pandas as pd

from ai.interface.model_holder import ModelHolder
from ai.model.consumption_service_model import ConsumptionServiceModel
from ai.model.ems_model import EmsModel
from ai.model.history_anomaly_detection_model import HistoryAnomalyDetectionModel
from ai.model.pv_monitoring_service_model import PvMonitoringServiceModel
from ai.model.pv_production_service_model import PvProductionServiceModel
from ai.model.setpoint_optimizer_model import SetpointOptimizerModel
from ai.model.stream_anomaly_detection_model import StreamAnomalyDetectionModel
from ai.model.load_monitor_model import LoadMonitorModel
from ai.model_holder.consumption_service_model_holder import ConsumptionServiceModelHolder
from ai.model_holder.ems_model_holder import EmsModelHolder
from ai.model_holder.history_anomaly_detection_model_holder import HistoryAnomalyDetectionModelHolder
from ai.model_holder.pv_monitoring_service_model_holder import PvMonitoringServiceModelHolder
from ai.model_holder.pv_production_service_model_holder import PvProductionServiceModelHolder
from ai.model_holder.setpoint_optimizer_model_holder import SetpointOptimizerModelHolder
from ai.model_holder.stream_anomaly_detection_model_holder import StreamAnomalyDetectionModelHolder
from ai.model_holder.load_monitor_model_holder import LoadMonitorModelHolder
from ai.utils.database_utils import DatabaseConnection
from ai.utils.env_utils import is_development_environment


def train_model(model_holder: ModelHolder, retrain_model: bool) -> None:
    """trains a model and sets it in the model holder"""

    if model_holder.is_instance_of(PvProductionServiceModelHolder):
        model_holder: PvProductionServiceModelHolder
        df_train, _ = get_train_eval_data(
            model_holder, min_days=14, train_weeks=5, eval_weeks=1)
        model_holder.set_model(PvProductionServiceModel.train(df_train))
    elif model_holder.is_instance_of(ConsumptionServiceModelHolder):
        model_holder: ConsumptionServiceModelHolder
        df = model_holder.get_dh().get_data(model_holder.get_start(),
                                            int(datetime.datetime.now().timestamp()))
        model_holder.set_model(ConsumptionServiceModel.train(df))
    elif model_holder.is_instance_of(EmsModelHolder):
        model_holder: EmsModelHolder
        df_train, df_eval = get_train_eval_data(
            model_holder, min_days=14, train_weeks=5, eval_weeks=1)

        # use xgb if EMS is next generation
        # TODO: make this even more configurable via a variable
        custom_regressor = None
        custom_regressor_args = None

        if model_holder.get_dh().is_next_generation() or os.getenv('EMS-NG'):
            logging.debug(
                f'training next gen EMS (id: {model_holder.get_model_id()})')
            custom_regressor = svm.SVR
            custom_regressor_args = {}

        model = EmsModel.train(
            df_train, custom_regressor, custom_regressor_args)

        model_holder.set_model(model)
        model_holder.set_model_error(0.5)

        errors = model_holder.get_model().evaluate(df_eval)

        if not is_development_environment():
            try:
                with DatabaseConnection.get_connection() as conn:
                    with conn.cursor() as cur:
                        insert_query = "INSERT into evaluations(variable, value, model, metric)" \
                            "VALUES (%s, %s, %s, %s)"

                        for mkey, mvalue in errors.items():
                            for vkey, vvalue in mvalue.items():
                                cur.execute(
                                    insert_query, (vkey, vvalue, model_holder.get_model_id(), mkey))
                        conn.commit()
            except Exception as e:
                logging.error(
                    f'exception evaluation store for {model_holder.get_model_id()}: {repr(e)}')

    elif model_holder.is_instance_of(PvMonitoringServiceModelHolder):
        model_holder: PvMonitoringServiceModelHolder
        df = model_holder.get_dh().get_data(
            model_holder.get_start(), model_holder.get_end())
        model_holder.set_model(PvMonitoringServiceModel.train(df))
    elif model_holder.is_instance_of(LoadMonitorModelHolder):
        model_holder: LoadMonitorModelHolder

        baseline_day = model_holder.find_recent_working_day()

        start_dt = baseline_day.replace(
            hour=0, minute=0, second=0, microsecond=0)
        end_dt = start_dt.replace(hour=23, minute=59, second=59, microsecond=0)
        start_ts = int(start_dt.timestamp())
        end_ts = int(end_dt.timestamp())

        df = model_holder.get_dh().get_data(start_ts, end_ts)
        model_holder.set_model(LoadMonitorModel.train(df))
    elif model_holder.is_instance_of(StreamAnomalyDetectionModelHolder):
        model_holder: StreamAnomalyDetectionModelHolder
        df = model_holder.get_dh().get_data(int(datetime.datetime.now().timestamp()) -
                                            model_holder._model.sample_size, int(datetime.datetime.now().timestamp()))
        model_holder.set_model(StreamAnomalyDetectionModel.train(df))
    elif model_holder.is_instance_of(HistoryAnomalyDetectionModelHolder):
        model_holder: HistoryAnomalyDetectionModelHolder
        df = model_holder.get_dh().get_data(
            model_holder.get_start(), model_holder.get_end())
        model_holder.set_model(HistoryAnomalyDetectionModel.train(df))
    elif model_holder.is_instance_of(SetpointOptimizerModelHolder):
        model_holder: SetpointOptimizerModelHolder
        model_holder.set_model(
            SetpointOptimizerModel.train(model_holder.get_dh()))
    else:
        raise ValueError('unsupported model holder type')
    model_holder.set_status(
        status="running, updated" if retrain_model else "running", ready=1, error=0, training=False)


def get_train_eval_data(model_holder, min_days=14, train_weeks=5, eval_weeks=1) -> Tuple[pd.DataFrame, pd.DataFrame]:
    end = datetime.datetime.now()
    start = datetime.datetime.fromtimestamp(model_holder.get_start())

    if (end - start) <= datetime.timedelta(days=min_days):
        raise ValueError(
            f"Too few data (< {min_days} days) for {model_holder.__class__.__name__} training!")
    else:
        if end - start > datetime.timedelta(weeks=train_weeks):
            start = end - datetime.timedelta(weeks=train_weeks)
        end_training = end - datetime.timedelta(weeks=eval_weeks)
        df_training = model_holder.get_dh().get_data(
            int(start.timestamp()), int(end_training.timestamp()))

    df_eval = model_holder.get_dh().get_data(
        int(end_training.timestamp()), int(end.timestamp()))

    return df_training, df_eval
