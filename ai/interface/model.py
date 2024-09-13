import abc

import pandas as pd

# How about from sklearn.base import BaseEstimator ?


class Model(abc.ABC):
    """each specific model must extend this base class to make sure all required methods are implemented"""

    @abc.abstractmethod
    def fit(self, x: pd.DataFrame, y: pd.DataFrame) -> None:
        """fit the x dataframe to the y dataframe"""

        pass

    @abc.abstractmethod
    def predict(self, x: pd.DataFrame) -> pd.DataFrame:
        """predicts the y dataframe from the x dataframe"""

        pass
