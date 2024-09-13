from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

from ai.interface.model import Model

from ai.preprocessing.ems_preprocessing import preprocess_ems_data, get_ems_features
from ai.utils.ems_component_utils import EmsComponent
from ai.utils.recursive_random_forest_utils import RecursiveRandomForest
from sklearn.metrics import mean_absolute_percentage_error, mean_absolute_error


class EmsModel(Model):
    """energy management model that controls heating pumps, batteries and consumers"""

    def __init__(self, full_recursive: bool = False, recursive_len: int = 4, model_type: int = 0, custom_regressor=None, custom_regressor_args=None, use_recursive_columns: bool = False) -> None:
        """inits the model

         :param full_recursive: turns the model prediction to a fully recursive prediction
         :param recursive_len: if the model is not fully recursive, this argument controls the
             lengths of the timestamps
         :param model_type: selects the correct model type for the ems
         """
        self.consumption_model: RecursiveRandomForest | RandomForestRegressor = RandomForestRegressor()
        self.pv_models: list[RecursiveRandomForest |
                             RandomForestRegressor] = []
        self.generator_models: list[RecursiveRandomForest |
                                    RandomForestRegressor] = []
        self.grid_models: list[RecursiveRandomForest |
                               RandomForestRegressor] = []
        self.battery_models: list[RecursiveRandomForest |
                                  RandomForestRegressor] = []
        self.charge_models: list[RecursiveRandomForest |
                                 RandomForestRegressor] = []
        self.house_models: list[RecursiveRandomForest |
                                RandomForestRegressor] = []
        self.electric_models: list[RecursiveRandomForest |
                                   RandomForestRegressor] = []
        self.pump_models: list[RecursiveRandomForest |
                               RandomForestRegressor] = []
        self.consumer_models: list[RecursiveRandomForest |
                                   RandomForestRegressor] = []
        self.soc_models: list[RecursiveRandomForest |
                              RandomForestRegressor] = []
        self.tpow_battery_models: list[RecursiveRandomForest |
                                       RandomForestRegressor] = []
        self.tpow_charge_models: list[RecursiveRandomForest |
                                      RandomForestRegressor] = []
        self.tpow_electric_models: list[RecursiveRandomForest |
                                        RandomForestRegressor] = []
        self.tpow_pump_models: list[RecursiveRandomForest |
                                    RandomForestRegressor] = []
        self.tpow_consumer_models: list[RecursiveRandomForest |
                                        RandomForestRegressor] = []

        self.full_recursive = full_recursive
        self.recursive_len = recursive_len
        self.model_type = model_type

        # keep track of model error to change tolerance of the control step
        self.error: float = 0
        self.max_charge: float = 0
        self.has_battery: bool = False

        self.custom_regressor = custom_regressor
        self.custom_regressor_args = custom_regressor_args

        self.use_recursive_columns = use_recursive_columns

    # noinspection PyMethodOverriding
    def fit(self, x: pd.DataFrame, y_consumption: pd.Series, y_pv: list[pd.Series], y_generator: list[pd.Series],
            y_grid: list[pd.Series], y_battery: list[pd.Series],
            y_charge: list[pd.Series], y_house: list[pd.Series], y_electric: list[pd.Series], y_pump: list[pd.Series],
            y_consumer: list[pd.Series], y_soc: list[pd.Series], y_tpow_battery: list[pd.Series],
            y_tpow_charge: list[pd.Series], y_tpow_electric: list[pd.Series], y_tpow_pump: list[pd.Series],
            y_tpow_consumer: list[pd.Series],
            recursive: dict[str, pd.DataFrame] = None) -> None:
        """fits the model

        :param x: features for the model prediction
        :param y_consumption: labels for the consumption power, if its an empty array no model will be trained
        :param y_pv: labels for the pv power, if its an empty array no model will be trained
        :param y_generator: labels for the generator power, if its an empty array no model will be trained
        :param y_grid: labels for the grid power, if its an empty array no model will be trained
        :param y_battery: labels for the battery power, if its an empty array no model will be trained
        :param y_charge: labels for the charge stations power, if its an empty array no model will be trained
        :param y_house: labels for the household power, if its an empty array no model will be trained
        :param y_electric: labels for the electric heating elements power,
            if it is an empty array no model will be trained
        :param y_pump: labels for the heating pump power, if its an empty array no model will be trained
        :param y_consumer: labels for the big consumers power, if its an empty array no model will be trained
        :param y_soc: labels for the soc of the battery, if its an empty array no model will be trained
        :param y_tpow_battery: labels for the target power of the battery,
            if it is an empty array no model will be trained
        :param y_tpow_charge: labels for the target power of the charging stations,
            if its an empty array no model will be trained
        :param y_tpow_electric: labels for the target power of the electric heating elements,
            if its an empty array no model will be trained
        :param y_tpow_pump: labels for the target power of the heating pumps,
            if its an empty array no model will be trained
        :param y_tpow_consumer: labels for the target power of the big consumers,
            if its an empty array no model will be trained
        :param recursive: here the recursive label is stored in case of a recursive model
        """

        # for every component, a model has to be trained

        # set battery related properties
        max_charge = 0
        if len(y_battery) != 0:
            self.has_battery = True
        for y in y_battery:
            max_charge += y.min()
        self.max_charge = max_charge

        self.consumption_model = EmsComponent.train_ems_component(x, y_consumption, recursive,
                                                                  full_recursive=self.full_recursive,
                                                                  recursive_len=self.recursive_len,
                                                                  model_type=self.model_type,
                                                                  custom_regressor=self.custom_regressor,
                                                                  custom_regressor_args=self.custom_regressor_args,
                                                                  use_recursive_columns=self.use_recursive_columns)

        for component, model_list in ((y_pv, self.pv_models),
                                      (y_generator, self.generator_models),
                                      (y_grid, self.grid_models),
                                      (y_house, self.house_models),
                                      (y_battery, self.battery_models),
                                      (y_electric, self.electric_models),
                                      (y_pump, self.pump_models),
                                      (y_consumer, self.consumer_models),
                                      (y_charge, self.charge_models),
                                      (y_soc, self.soc_models),
                                      (y_tpow_charge, self.tpow_charge_models),
                                      (y_tpow_electric, self.tpow_electric_models),
                                      (y_tpow_pump, self.tpow_pump_models),
                                      (y_tpow_consumer, self.tpow_consumer_models),
                                      (y_tpow_battery, self.tpow_battery_models)):
            for y in component:
                model = EmsComponent.train_ems_component(x, y, recursive, full_recursive=self.full_recursive,
                                                         recursive_len=self.recursive_len,
                                                         model_type=self.model_type,
                                                         custom_regressor=self.custom_regressor,
                                                         custom_regressor_args=self.custom_regressor_args,
                                                         use_recursive_columns=self.use_recursive_columns)
                model_list.append(model)  # models are stored in self.xxx

    def predict(
            self, x: pd.DataFrame, recursive: dict[str, pd.DataFrame] = None) -> \
            tuple[np.array, list[np.array], list[np.array], list[np.array], list[np.array], list[np.array],
                  list[np.array], list[np.array], list[np.array], list[np.array], list[np.array], list[np.array],
                  list[np.array], list[np.array], list[np.array], list[np.array]]:
        """predicts the power and target power of the connected components

        :param x: input features for the prediction
        :param recursive: recursive labels if the model is a recursive one
        """

        x_to_pred = x

        if self.use_recursive_columns and recursive is not None and self.custom_regressor is not None:
            recursive_df = pd.concat(recursive, axis=1)
            recursive_df.columns = recursive_df.columns.get_level_values(1)
            x_to_pred = x.join(recursive_df)

        if recursive is not None and self.custom_regressor is None:
            y_consumption = self.consumption_model.predict(
                x_to_pred, recursive[self.consumption_model.name])
        else:
            y_consumption = self.consumption_model.predict(x_to_pred)

        y_pv = []
        for model in self.pv_models:
            if recursive is not None and self.custom_regressor is None:
                p = model.predict(x_to_pred, recursive[model.name])
            else:
                p = model.predict(x_to_pred)
            radiation_names = []
            for c in x.columns:
                if "radiation" in c:
                    radiation_names.append(c)
            p = (p * (x[radiation_names] != 0).any(axis=1)).values
            y_pv.append(p * (p > 0.3))

        y_generator, y_grid, y_charge, y_house, y_battery, y_electric, y_pump, y_consumer = \
            [], [], [], [], [], [], [], []

        for model_list, result_list in (
                (self.generator_models, y_generator),
                (self.grid_models, y_grid),
                (self.charge_models, y_charge),
                (self.house_models, y_house),
                (self.battery_models, y_battery),
                (self.electric_models, y_electric),
                (self.pump_models, y_pump),
                (self.consumer_models, y_consumer)):
            for model in model_list:
                if recursive is not None and self.custom_regressor is None:
                    result_list.append(model.predict(
                        x_to_pred, recursive[model.name]))
                else:
                    result_list.append(model.predict(x_to_pred))

        y_soc, y_tpow_battery, y_tpow_charge, y_tpow_electric, y_tpow_pump, y_tpow_consumer = [
        ], [], [], [], [], []

        for model_list, result_list in (
                (self.soc_models, y_soc),
                (self.tpow_battery_models, y_tpow_battery),
                (self.tpow_charge_models, y_tpow_charge),
                (self.tpow_electric_models, y_tpow_electric),
                (self.tpow_pump_models, y_tpow_pump),
                (self.tpow_consumer_models, y_tpow_consumer)):
            for model in model_list:
                if recursive is not None and self.custom_regressor is None:
                    if recursive[model.name].empty:
                        pred = np.zeros(len(x))
                    else:
                        pred = model.predict(x_to_pred, recursive[model.name])
                        pred[pred > 100] = 100
                        pred[pred < -100] = -100
                    result_list.append(pred)
                else:
                    result_list.append(model.predict(x_to_pred))

        return (y_consumption, y_pv, y_generator, y_grid, y_battery, y_charge,
                y_house, y_electric, y_pump, y_consumer, y_soc, y_tpow_battery,
                y_tpow_charge, y_tpow_electric, y_tpow_pump, y_tpow_consumer)

    def evaluate(self, df: pd.DataFrame, add_hour=False) -> dict[str, dict[str, float]]:
        '''Evaluates a trained model on the period defined by start to end'''

        preprocessed = preprocess_ems_data(df, 15, True, add_hour=add_hour)
        (x, y_consumption, y_pv, y_generator, y_grid, y_battery,
         y_charge, y_house, y_electric, y_pump, y_consumer,
         y_soc, y_tpow_battery, y_tpow_charge, y_tpow_electric, y_tpow_pump,
         y_tpow_consumer, recursive) = get_ems_features(
            preprocessed,
            lag_steps=[15, 30, 45, 60],
            prediction_steps=[15, 30, 45, 60],
            time_resolution=15,
            lag_label=[15])

        (y_consumption_pred, y_pv_pred, y_generator_pred, y_grid_pred, y_battery_pred, y_charge_pred,
         y_house_pred, y_electric_pred, y_pump_pred, y_consumer_pred, y_soc_pred, y_tpow_battery_pred,
         y_tpow_charge_pred, y_tpow_electric_pred, y_tpow_pump_pred, y_tpow_consumer_pred) = self.predict(x, recursive)

        # prepare error calcs
        pairs = {
            "y_consumption": (y_consumption, y_consumption_pred),
            "y_pv": (y_pv, y_pv_pred),
            "y_generator": (y_generator, y_generator_pred),
            "y_grid": (y_grid, y_grid_pred),
            "y_battery": (y_battery, y_battery_pred),
            "y_charge": (y_charge, y_charge_pred),
            "y_house": (y_house, y_house_pred),
            "y_electric": (y_electric, y_electric_pred),
            "y_pump": (y_pump, y_pump_pred),
            "y_consumer": (y_consumer, y_consumer_pred),
            "y_soc": (y_soc, y_soc_pred),
            "y_tpow_battery": (y_tpow_battery, y_tpow_battery_pred),
            "y_tpow_charge": (y_tpow_charge, y_tpow_charge_pred),
            "y_tpow_electric": (y_tpow_electric, y_tpow_electric_pred),
            "y_tpow_pump": (y_tpow_pump, y_tpow_pump_pred),
            "y_tpow_consumer": (y_tpow_consumer, y_tpow_consumer_pred)
        }

        metrics = {
            "MAPE": {"metric": mean_absolute_percentage_error, "limit": 1},
            "MAE": {"metric": mean_absolute_error},
            "Corr": {"metric": np.corrcoef},
        }

        # Calc error measures
        error_dict = dict()
        for mkey, mval in metrics.items():
            model_errors = pairs.copy()
            mean = 0
            count = 0

            for key, val in model_errors.items():
                if len(val[0]) == 0:
                    model_errors[key] = -99
                else:
                    if key != "y_consumption":
                        error = 0
                        instance_count = 0
                        for instance in range(0, len(val[0])):
                            count += 1
                            instance_count += 1
                            er = mval["metric"](
                                val[0][instance], val[1][instance])

                            if mkey == "Corr":
                                if np.isnan(er).any():  # case when all values are 0
                                    er = 0
                                    instance_count -= 1
                                    count -= 1
                                else:
                                    er = er[0, 1]

                            if "limit" in mval.keys():
                                if er > mval["limit"]:
                                    er = mval["limit"]
                            error += er
                            mean += er
                        if instance_count == 0:
                            error = 0
                        else:
                            error = error/instance_count
                    else:
                        count += 1
                        error = mval["metric"](val[0], val[1])
                        if mkey == "Corr":
                            error = error[0, 1]

                        if "limit" in mval.keys():
                            if error > mval["limit"]:
                                error = mval["limit"]
                        mean += error

                    model_errors[key] = error

            if count == 0:
                model_errors["mean"] = 0
            else:
                model_errors["mean"] = mean/count

            model_errors = {key: value for key,
                            value in model_errors.items() if value != -99}
            error_dict[mkey] = model_errors

        return error_dict

    @staticmethod
    def train(df: pd.DataFrame, custom_regressor=None, custom_regressor_args=None, add_hour=False) -> EmsModel:
        """train a model with the passed data and return it"""

        preprocessed = preprocess_ems_data(df, 15, True, add_hour=add_hour)
        (x, y_consumption, y_pv, y_generator, y_grid, y_battery,
         y_charge, y_house, y_electric, y_pump, y_consumer,
         y_soc, y_tpow_battery, y_tpow_charge, y_tpow_electric, y_tpow_pump,
         y_tpow_consumer, recursive) = get_ems_features(
            preprocessed,
            lag_steps=[15, 30, 45, 60],
            prediction_steps=[15, 30, 45, 60],
            time_resolution=15,
            lag_label=[15])
        model = EmsModel(custom_regressor=custom_regressor,
                         custom_regressor_args=custom_regressor_args)
        model.fit(x, y_consumption, y_pv, y_generator, y_grid, y_battery, y_charge,
                  y_house, y_electric, y_pump, y_consumer, y_soc, y_tpow_battery,
                  y_tpow_charge, y_tpow_electric, y_tpow_pump, y_tpow_consumer, recursive)

        return model
