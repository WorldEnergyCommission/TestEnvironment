import pandas
import pandas as pd

from ai.utils.preprocessing_utils import preprocess_dataframe


def preprocess_pv_monitoring_service_data(df: pd.DataFrame) -> pandas.DataFrame:
    """preprocesses the data frame for the pv monitoring service model training,
    removes outliers, interpolates missing values and smoothens the input"""

    # preprocess the df using common function

    return preprocess_dataframe(df,
                                df_resample_offset='15min',
                                clip_config_dict={'power': (0, None)},
                                gaussian_filter_columns=tuple(df.columns),
                                end_callback=lambda _df: _df.resample('1d').agg({col: 'mean' if col == 'outdoor_temperature' else 'sum' for col in _df.columns}).iloc[:-1])
        
