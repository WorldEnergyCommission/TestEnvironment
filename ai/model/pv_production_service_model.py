from __future__ import annotations

import numpy as np
import pandas as pd
import sklearn.ensemble

from ai.interface.model import Model
from ai.preprocessing.pv_production_consumption_service_preprocessing import \
    preprocess_pv_production_consumption_service_data, get_pv_production_consumption_service_features
from ai.utils.pv_production_consumption_service_utils import predict_power_recursively


class PvProductionServiceModel(Model):
    def __init__(self) -> None:
        """inits the model"""

        self.factor = 0
        self.model = None

    def fit(self, x: pd.DataFrame, y: pd.DataFrame) -> None:
        """fits the model

        :param x: input features for the model training
        :param y: input labels for the model training
        """

        self.model = sklearn.ensemble.RandomForestRegressor()
        self.model.fit(x, y)

    def predict(self, x: pd.DataFrame, recursive: bool = False) -> tuple[list[float], list[float]]:
        """uses the pv production service model to predict the power of a plant

        :param x: features for the prediction
        :param recursive: indicates whether the prediction should be calculated recursive or not
        """

        if recursive:
            power = predict_power_recursively(x, self.model)
            power = power * (power > 0)
        else:
            power = self.model.predict(x)
            power = power * (power > 0)

        energy = np.cumsum(power * 0.25)

        return power.tolist(), energy.tolist()

    @staticmethod
    def train(df: pd.DataFrame) -> PvProductionServiceModel:
        """train a model with the passed data and return it"""

        df = preprocess_pv_production_consumption_service_data(df)
        x, y = get_pv_production_consumption_service_features(df, lag_steps=[15, 30, 45, 60], prediction_steps=[
            15, 30, 45, 60], time_resolution=15)
        model = PvProductionServiceModel()
        model.fit(x, y)

        return model
