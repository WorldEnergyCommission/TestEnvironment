import numpy as np
import pandas as pd
import sklearn.ensemble
import sklearn.model_selection
import xgboost


class RecursiveRandomForest:
    """recursive random forest model which recursively predicts future samples of time series data for the ems model"""

    def __init__(self, name: str, full_recursive: bool = True, recursive_range: int = 4, model_type: int = 0) -> None:
        """inits a recursive random forest model

        :param name: identifier of the model
        :param full_recursive: indicates if the whole timeseries should be calculated recursively
        :param recursive_range: indicates the length until the time series will not get calculated recursively
        :param model_type: optional to change the underlying prediction model
        """

        self.name = name
        self.full_recursive = full_recursive
        self.recursive_range = recursive_range
        self.model_type = model_type
        if self.model_type == 0:
            self.model = sklearn.ensemble.RandomForestRegressor(n_estimators=128, max_depth=32,
                                                                max_features="log2", min_samples_leaf=4)
            self.model_not_recursive = sklearn.ensemble.RandomForestRegressor(n_estimators=128, max_depth=32,
                                                                              max_features="log2", min_samples_leaf=4)

        elif self.model_type == 1:
            self.model = xgboost.XGBRegressor(n_estimators=1000,
                                              objective='reg:squarederror',
                                              learning_rate=0.1,
                                              colsample_bytree=0.6,
                                              max_depth=5,
                                              min_child_weight=6)
            self.model_not_recursive = xgboost.XGBRegressor(n_estimators=1000,
                                                            objective='reg:squarederror',
                                                            learning_rate=0.1,
                                                            colsample_bytree=0.6,
                                                            max_depth=5,
                                                            min_child_weight=6)

    def fit(self, x: pd.DataFrame, r: pd.DataFrame, y: pd.Series) -> None:
        """fit trains the recursive forest

        :param x: stores the features of the model
        :param r: stores the recursive labels
        :param y: stores the labels
        """

        x_r = pd.concat([x, r], axis=1, sort=True)
        if self.model_type == 1:
            x_train, x_test, y_train, y_test = sklearn.model_selection.train_test_split(
                x_r[1:], y[1:], test_size=0.2)
            self.model.fit(x_train, y_train, eval_set=[(x_train, y_train), (x_test, y_test)],
                           eval_metric="rmse", early_stopping_rounds=100, verbose=False)
        else:
            self.model.fit(x_r[1:], y[1:])

        if not self.full_recursive:
            if self.model_type == 1:
                x_train, x_test, y_train, y_test = sklearn.model_selection.train_test_split(
                    x, y, test_size=0.2)
                self.model_not_recursive.fit(x_train, y_train, eval_set=[(x_train, y_train), (x_test, y_test)],
                                             eval_metric="rmse", early_stopping_rounds=100, verbose=False)
            else:
                self.model_not_recursive.fit(x, y)

    def predict(self, x: pd.DataFrame, r: pd.DataFrame) -> np.array:
        """predicts the future steps of a time series

        :param x: stores the features of the model
        :param r: stores the recursive labels
        """

        start = x.index[0]
        pv = np.zeros(len(x))
        if self.full_recursive:
            loop = len(x)
        else:
            loop = self.recursive_range

        for i in range(loop):
            if self.model_type == 1:
                pred = self.model.predict(pd.concat([x.loc[start + pd.to_timedelta(i * 15, 'min')],
                                                     r.loc[start + pd.to_timedelta(i * 15, 'min')]]).values.reshape(1,
                                                                                                                    -1),
                                          iteration_range=(0, self.model.best_ntree_limit))
            else:
                pred = self.model.predict(
                    pd.concat([x.loc[start + pd.to_timedelta(i * 15, 'min')],
                               r.loc[start + pd.to_timedelta(i * 15, 'min')]]).to_frame().transpose())
            if i != (len(x) - 1):
                r.loc[start + pd.to_timedelta((i + 1) * 15, 'min')] = pred
            pv[i] = pred

        if not self.full_recursive:
            if self.model_type == 1:
                pred = self.model_not_recursive.predict(
                    x, iteration_range=(0, self.model.best_ntree_limit))
            else:
                pred = self.model_not_recursive.predict(x)

            pv[(self.recursive_range - 1):] = pred[(self.recursive_range - 1):]

        return pv
