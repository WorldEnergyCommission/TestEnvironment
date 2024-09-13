import pandas as pd

from ai.utils.data_utils import forecast_feature, autoregressive_feature
from ai.utils.preprocessing_utils import preprocess_dataframe


def preprocess_ems_end_callback(df: pd.DataFrame) -> pd.DataFrame:
    """end callback to the preprocessing"""

    # compute all the given color names
    grid_names = [key for key in df.columns if "grid" in key]
    pv_names = [key for key in df.columns if "pv" in key]
    battery_names = [key for key in df.columns if (
        "battery" in key) and ("soc" not in key) and ("tpow" not in key)]

    # compute the total consumption
    df["consumption"] = df.loc[:, grid_names].sum(axis=1) + df.loc[:, pv_names].sum(
        axis=1) + df.loc[:, battery_names].sum(axis=1)

    # noinspection PyUnresolvedReferences
    df['dayofweek'] = df.index.dayofweek
    # noinspection PyUnresolvedReferences
    df['quarter'] = df.index.quarter
    # noinspection PyUnresolvedReferences
    df['month'] = df.index.month
    # noinspection PyUnresolvedReferences
    df['year'] = df.index.year
    # noinspection PyUnresolvedReferences
    df['dayofyear'] = df.index.dayofyear
    # noinspection PyUnresolvedReferences
    df['dayofmonth'] = df.index.day

    return df


def preprocess_ems_data(df: pd.DataFrame, time_resolution: int, filter_data: bool, add_hour: bool = False) -> pd.DataFrame:
    """preprocesses data for the ems model training, interpolates missing values,
    smooths input, calculates time features and consumption

    :param df: input data
    :param time_resolution: periodicity of the features in minutes
    :param filter_data: indicates whether the input should be smoothened or not
    """

    # preprocess the df using this common function
    return preprocess_dataframe(df,
                                df_resample_offset=f'{time_resolution}min',
                                gaussian_filter_columns=tuple(
                                    set(df.columns) - {'soc', 'tpow'}) if filter_data else (),
                                encode_timestamps=True,
                                add_hour=add_hour,
                                end_callback=preprocess_ems_end_callback)


def get_ems_features_for_columns(df: pd.DataFrame, columns: list[str]) -> list[pd.Series]:
    """convert the passed column names into series objects"""

    return [df[x].dropna() for x in columns]


def get_ems_features_for_dataframe(
        df: pd.DataFrame, columns_tuple: tuple[list[str], ...]) -> tuple[list[pd.Series], ...]:
    """convert the multiple passed column name lists into series objects of the same shape and amount"""

    return tuple((get_ems_features_for_columns(df, x) for x in columns_tuple))


def get_ems_features(df: pd.DataFrame, lag_steps: list[int], prediction_steps: list[int],
                     time_resolution: int, lag_label: list[int] = None) -> \
        tuple[pd.DataFrame, pd.Series, list[pd.Series], list[pd.Series], list[pd.Series], list[pd.Series],
              list[pd.Series], list[pd.Series], list[pd.Series], list[pd.Series], list[pd.Series],
              list[pd.Series], list[pd.Series], list[pd.Series], list[pd.Series], list[pd.Series],
              list[pd.Series], dict[str, pd.DataFrame]]:
    """reforms the data into training features for the ems model training

    :param df: pandas dataframe that hold the input data
    :param lag_steps: how many timesteps the features should lack behind
    :param prediction_steps: how many timesteps the features look ahead
    :param time_resolution: periodicity of the features in minutes
    :param lag_label: how many timesteps the label lacks behind
    """

    columns = ["outdoor_temperature", "horizontal_radiation", "diffuse_radiation",
               "inclined_radiation", "normal_radiation"]
    recursive = {}

    to_drop = [c for c in df.columns if c not in columns + ["minute_cos", "minute_sin", "hour_sin", "hour_cos", "day_cos", "day_sin",
                                                            "dayofweek", "quarter", "month", "year", "dayofyear",
                                                            "dayofmonth"]]
    pv_columns = []
    generator_columns = []
    grid_columns = []
    battery_columns = []
    house_columns = []
    charge_columns = []
    electric_heating_columns = []
    heating_pump = []
    big_consumer = []
    battery_soc = []
    target_power_battery = []
    target_power_charge = []
    target_power_heating = []
    target_power_pump = []
    target_power_consumer = []
    weather_columns = []

    for column in df.columns:
        if column in columns:
            temp = forecast_feature(
                df[column], prediction_steps, time_resolution)
            weather_columns += list(temp.columns)
            weather_columns += [column]

            df = pd.concat([df, temp], axis=1, sort=True)

            temp = autoregressive_feature(
                df[column], lag_steps, time_resolution)
            weather_columns += list(temp.columns)
            df = pd.concat([df, temp], axis=1, sort=True)
            continue
        if "pv" in column:
            pv_columns.append(column)
        elif "generator" in column:
            generator_columns.append(column)
        elif "grid" in column:
            grid_columns.append(column)
        elif ("battery" in column) and ("soc" not in column) and ("tpow" not in column):
            battery_columns.append(column)
        elif ("charge" in column) and ("tpow" not in column):
            charge_columns.append(column)
        elif "house" in column:
            house_columns.append(column)
        elif ("electric" in column) and ("tpow" not in column):
            electric_heating_columns.append(column)
        elif ("heating_pump" in column) and ("tpow" not in column):
            heating_pump.append(column)
        elif ("big_consumer" in column) and ("tpow" not in column):
            big_consumer.append(column)
        elif "soc" in column:
            battery_soc.append(column)
        elif ("tpow" in column) and ("battery" in column):
            target_power_battery.append(column)
        elif ("charge" in column) and ("tpow" in column):
            target_power_charge.append(column)
        elif ("electric" in column) and ("tpow" in column):
            target_power_heating.append(column)
        elif ("heating_pump" in column) and ("tpow" in column):
            target_power_pump.append(column)
        elif ("big_consumer" in column) and ("tpow" in column):
            target_power_consumer.append(column)
        else:
            weather_columns.append(column)

        if lag_label is not None:
            recursive[column] = autoregressive_feature(
                df[column], lag_label, 15)

    df = df.dropna(subset=weather_columns)

    x = df.drop(to_drop, axis=1)
    y = df.consumption

    (y_pv, y_generator, y_grid, y_battery, y_charge, y_house, y_electric, y_pump, y_consumer, y_soc,
     y_tpow_bat, y_tpow_charge, y_tpow_heating, y_tpow_pump, y_tpow_consumer) = get_ems_features_for_dataframe(df, (
         pv_columns, generator_columns, grid_columns, battery_columns, charge_columns, house_columns,
         electric_heating_columns, heating_pump, big_consumer, battery_soc, target_power_battery,
         target_power_charge, target_power_heating, target_power_pump, target_power_consumer))

    start = x.index[0]
    end = x.index[-1]

    for column, val in recursive.items():
        recursive[column] = val.loc[start:end].dropna()

    return (x, y, y_pv, y_generator, y_grid, y_battery, y_charge, y_house, y_electric, y_pump,
            y_consumer, y_soc, y_tpow_bat, y_tpow_charge, y_tpow_heating, y_tpow_pump, y_tpow_consumer, recursive)
