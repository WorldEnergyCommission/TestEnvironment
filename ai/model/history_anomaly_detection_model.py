from __future__ import annotations

import numpy as np
import pandas as pd
import rrcf

from ai.interface.model import Model
from ai.preprocessing.stream_history_anomaly_detection_preprocessing import \
    preprocess_stream_history_anomaly_detection_data, \
    get_stream_history_anomaly_detection_features
from ai.utils.stream_history_anomaly_detection_utils import anomaly_score


class HistoryAnomalyDetectionModel(Model):
    def __init__(self, n_trees: int = 100, sample_size: int = 1600, shingle_size: int = 4) -> None:
        """inits the history anomaly detection model

        :param n_trees: number of trees inside the forrest
        :param sample_size: number of samples per leaf
        :param shingle_size: number of "rolling window" size
        """

        self.forest = []
        self.n_trees = n_trees
        self.sample_size = sample_size
        self.shingle_size = shingle_size

    def fit(self, x: np.array, _: object) -> None:
        """ fits the anomaly detection model to a batch of data

        :param x: input features
        :param _: not used
        """

        self.forest = []
        while len(self.forest) < self.n_trees:
            idxs = np.random.choice(len(x), size=(
                len(x) // self.sample_size, self.sample_size), replace=False)
            trees = [rrcf.RCTree(x[ix], index_labels=ix) for ix in idxs]
            self.forest.extend(trees)

    def predict(self, x: pd.DataFrame) -> list[float]:
        """ calculates the anomaly score of multiple data points"""

        y = []
        for point in x:
            y.append(anomaly_score(self.forest, point))

        return y

    @staticmethod
    def train(df: pd.DataFrame) -> HistoryAnomalyDetectionModel:
        """train a model and return it with the passed data"""

        model = HistoryAnomalyDetectionModel()
        df = preprocess_stream_history_anomaly_detection_data(df)
        x = get_stream_history_anomaly_detection_features(df, model.shingle_size)

        model.fit(x, None)
        return model
