from __future__ import annotations

import numpy as np
import pandas as pd
import rrcf

from ai.interface.model import Model
from ai.preprocessing.load_monitor_preprocessing import preprocess_load_monitor_data
from ai.utils.s3_utils import VersionedClass
from sklearn.cluster import KMeans


class LoadMonitorModel(Model, VersionedClass):
    def __init__(self, threshold: float = None, window_size: int = 7, step_size: int = 1, center: bool = False, num_clusters: int = 3, threshold_correction: float = 0.25) -> None:
        """Load Monitoring Model which determines a threshold in training by clustering a reference day's load into load levels. Based on the threshold the Load Monitoring Models simply implements a Threshold function.

        :param threshold: The threshold above which load is classified -> estimated in training, defaults to None
        :type threshold: float, optional
        :param window_size: size of the rolling window, defaults to 7 (1min intervals)
        :type window_size: int, optional
        :param step_size: number of timestamps to shift the window in the rolling window, defaults to 1
        :type step_size: int, optional
        :param center: rolling window calculate for center (=True) or right (=False), defaults to False
        :type center: bool, optional
        :param num_clusters: number of clusters to calculate, defaults to 3 for baking monitor because power is seperated into non-working, working and load periods
        :type num_clusters: int, optional
        :param threshold_correction: corrects the calculation of the thresholds towards the lower cluster center like: correction = 0, th is the exact mean of two cluster centers. Higher correction -> closer to lower center, defaults to 0.25
        :type threshold_correction: float, optional
        """

        self.threshold = threshold
        self.window_size = window_size
        self.step_size = step_size
        self.center = center
        self.num_clusters = num_clusters

        self.threshold_correction = threshold_correction

    @classmethod
    def class_dict_adaptions(cls, version: int, class_dict: dict[str, ...]) -> dict[str, ...]:
        """modifications based on version"""

        return class_dict

    @property
    def version(self) -> int:
        """the current version"""

        return 1

    def fit(self, x: pd.DataFrame, _: object) -> None:
        """fits the load monitor threshold based on previous day

        :param x: input features
        :param _: not used
        """

        # drop na, otherwirse Kmeans won't work
        # wrap again with pd.DataFrame to make sure its a df
        # because it might be a np array?!
        trainig_data = pd.DataFrame(x).dropna(axis=0)

        # Fit K-means clustering model
        kmeans = KMeans(n_clusters=self.num_clusters)
        kmeans.fit(trainig_data)

        # Get the centroids of the clusters
        centroids = kmeans.cluster_centers_

        # Sort the centroids
        centroids_sorted = np.sort(centroids, axis=0)

        # The threshold will be the midpoint between the two centroids
        # use list for future adoption
        self.threshold = [
            (centroids_sorted[1] + centroids_sorted[2]) / 2+self.threshold_correction][0][0]

    def predict(self, x: float) -> bool:
        """determines whether the value exceeds the model threshold or not"""

        if x > self.threshold:
            return 1.0
        else:
            return 0.0

    @staticmethod
    def train(df: pd.DataFrame) -> LoadMonitorModel:
        """train a model and return it with the passed data"""

        model = LoadMonitorModel()
        x = preprocess_load_monitor_data(df, model)

        model.fit(x, None)

        return model
