from __future__ import annotations

import numpy as np
import pandas as pd

from ai.interface.model import Model
from ai.preprocessing.pv_monitoring_service_preprocessing import preprocess_pv_monitoring_service_data
from ai.utils.math_utils import get_std_with_default


class PvMonitoringServiceModel(Model):
    def __init__(self):
        """inits the model"""

        self.factor = 0
        self.start_date = 0
        # cold day coorection points (temperatures)
        # days with temp below lower point result in 100% efficiency
        # days with temp above upper point result in normal efficiency calculation
        # days with temp between result in linearely correcting the factor value from 0 to self.factor
        self.temp_correction_points = (5,10) 

    def fit(self, x: pd.DataFrame, _: object = None) -> None:
        """fits the model"""

        self.start_date = (x.index[0].timestamp())
        rate = self.calculate_rate(x, True)
        self.factor = rate.mean() - get_std_with_default(rate)

    def predict(self, x: pd.DataFrame, decay_per_year: float = 0) -> list[float]:
        """calculates the current efficiency of the pv plant,
        relative to the efficiency during the referenced time window

        :param x: input features for the prediction
        :param decay_per_year: how much the pv plant efficiency decays per year
        """

        rate = self.calculate_rate(x, False)
        efficiency = []
        for i, r in enumerate(rate):
            f = self.factor * \
                (1 + decay_per_year * int((self.start_date -
                                           int(x.index[i].timestamp())) / 31557600))
            if r == np.nan:
                efficiency.append(0)
            elif r >= f:
                efficiency.append(100)            
            # days with mean temperature below lower temp correction point
            elif x.iloc[i]["outdoor_temperature"] < self.temp_correction_points[0]:
                efficiency.append(100)
            # days with mean temperature in correction interval linearely correct factor
            elif (x.iloc[i]["outdoor_temperature"] > self.temp_correction_points[0]) and (x.iloc[i]["outdoor_temperature"] < self.temp_correction_points[1]): # days with mean temperature lower than ~5°C
                f_corr = self.factor*(x.iloc[i]["outdoor_temperature"]-self.temp_correction_points[0]) / (self.temp_correction_points[1]-self.temp_correction_points[0])
                if r >= f_corr:
                    efficiency.append(100)
                else:
                    e = 100 - (f_corr - r) / f_corr * 100
                    efficiency.append(e)            
            else:
                e = 100 - (f - r) / f * 100
                efficiency.append(e)
        return efficiency

    @staticmethod
    def calculate_rate(x: pd.DataFrame, remove_outliers: bool) -> pd.Series:
        """calculate the rate for the pv plant"""

        rate = (x["power"] / x["horizontal_radiation"]).replace([np.inf, -np.inf], 0)
        if remove_outliers:
            max_val = rate.mean() + 2.5 * get_std_with_default(rate)
            min_val = rate.mean() - 2.5 * get_std_with_default(rate)
            rate_without_outliers = rate.loc[(rate > min_val) & (rate < max_val)]
            return rate_without_outliers
        else:
            return rate

    @staticmethod
    def train(df: pd.DataFrame) -> PvMonitoringServiceModel:
        """train a model with the passed data and return it"""

        df = preprocess_pv_monitoring_service_data(df)

        model = PvMonitoringServiceModel()
        model.fit(df)

        return model
