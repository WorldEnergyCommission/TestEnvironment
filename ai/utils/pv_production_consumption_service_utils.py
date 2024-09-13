import numpy as np
import pandas as pd
import sklearn.ensemble


def predict_power_recursively(x: pd.DataFrame, model: sklearn.ensemble.RandomForestRegressor) -> np.array:
    """predict power recursively step by step"""

    start = x.index[0]
    power = np.zeros(len(x))
    for i in range(len(x)):
        pred = model.predict(
            x.loc[start + pd.to_timedelta(i * 15, 'min')].values.reshape(1, -1))
        if i != (len(x) - 1):
            x.loc[start + pd.to_timedelta((i + 1)
                                          * 15, 'min')]["power(k-15min)"] = pred
        power[i] = pred
    return power
