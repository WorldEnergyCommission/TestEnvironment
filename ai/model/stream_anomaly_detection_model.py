from __future__ import annotations

import numpy as np
import pandas as pd
import rrcf

from ai.interface.model import Model
from ai.preprocessing.stream_history_anomaly_detection_preprocessing import \
    preprocess_stream_history_anomaly_detection_data, \
    get_stream_history_anomaly_detection_features
from ai.utils.s3_utils import VersionedClass
from ai.utils.stream_history_anomaly_detection_utils import anomaly_score


class StreamAnomalyDetectionModel(Model, VersionedClass):
    def __init__(self, n_trees: int = 100, sample_size: int = 1600, shingle_size: int = 4) -> None:
        """initializes the stream anomaly detection model

        :param n_trees: number of trees inside the forrest
        :param sample_size: number of samples per leaf
        :param shingle_size: number of "rolling window" size
        """

        self.forest = []
        self.n_trees = n_trees
        self.sample_size = sample_size
        self.shingle_size = shingle_size
        self.index = 0

    @classmethod
    def class_dict_adaptions(cls, version: int, class_dict: dict[str, ...]) -> dict[str, ...]:
        """modifications based on version"""

        return class_dict

    @property
    def version(self) -> int:
        """the current version"""

        return 1

    def fit(self, x: np.array, _: object) -> None:
        """fits the stream anomaly detection model to a stream of data

        :param x: input features
        :param _: not used
        """

        self.forest = []
        while len(self.forest) < self.n_trees:
            self.forest.append(rrcf.RCTree())

        for point in x:
            self.insert_point(point)

    def insert_point(self, point: float) -> None:
        """inserts a new datapoint in the forest"""

        if len(self.forest) == 0:
            raise ValueError(
                "empty forest, use 'fit' before you try to calculate an anomaly score")

        for tree in self.forest:
            if len(tree.leaves) > self.sample_size:
                tree.forget_point(self.index - self.sample_size)

            tree.insert_point(point, self.index)

        self.index += 1

    def predict(self, x: np.array) -> list[float]:
        """calculates the anomaly score of multiple data points"""

        y = []
        for point in x:
            y.append(anomaly_score(self.forest, point))

        return y

    @staticmethod
    def train(df: pd.DataFrame) -> StreamAnomalyDetectionModel:
        """train a model and return it with the passed data"""

        model = StreamAnomalyDetectionModel()
        df = preprocess_stream_history_anomaly_detection_data(df)
        x = get_stream_history_anomaly_detection_features(df, model.shingle_size)

        model.fit(x, None)

        return model
