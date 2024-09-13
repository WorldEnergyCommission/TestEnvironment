import pandas
import pandas as pd

from ai.utils.preprocessing_utils import preprocess_dataframe


def preprocess_load_monitor_data(df: pd.DataFrame, model) -> pandas.DataFrame | float:
    """preprocesses the data frame for the load monitoring service model training and predictions,
    removes outliers and interpolates missing values smoothens the input"""

    df = df.rolling(
        window=model.window_size, step=model.step_size, center=model.center).mean()

    df = df.interpolate('linear')
    df = preprocess_dataframe(df)

    x = df.values.reshape(-1, 1)

    return x
