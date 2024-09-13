from __future__ import annotations

import pandas as pd
from typing import Any
import sklearn.ensemble

from ai.utils.http_utils import fetch_last_value, fetch_data_from_http, append_data_to_dataframe_http
from ai.utils.recursive_random_forest_utils import RecursiveRandomForest


class EmsComponent:
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int) -> None:
        """creates a new ems component instance"""

        self.name = name
        self.power = power
        self.error = error
        self.title = title
        self.count = count

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> EmsComponent:
        """creates an ems component instance from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                t.append([key, val["power"], 1, 1, val["error"], val["title"]])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count)

    def to_dict(self) -> dict[str, object]:
        """convert the ems component to a dictionary"""

        components = {}
        for n, p, e, t in zip(self.name, self.power, self.error,
                              self.title):
            components[n] = {"power": p, "error": e, "title": t}

        return {"count": self.count, "components": components}

    def get_data(self, start: int, end: int, project_id: str, agg: str = "avg") -> pd.DataFrame:
        """retrieve data for the ems component"""

        df = pd.DataFrame()
        for p, n in zip(self.power, self.name):
            if p == "":
                continue
            data = fetch_data_from_http(
                p, project_id, start, end, agg=agg, last_value_fill=True)
            df = append_data_to_dataframe_http(df, data, n + "_power")

        if df.empty:
            return df
        else:
            return df.set_index("ts")

    @staticmethod
    def train_ems_component(
            x: pd.DataFrame, y: pd.Series, recursive: dict[str, pd.DataFrame], full_recursive: bool,
            recursive_len: int, model_type: int, custom_regressor=None, custom_regressor_args: Any | None = None, use_recursive_columns: bool = False) -> Any | RecursiveRandomForest | sklearn.ensemble.RandomForestRegressor:
        """helper method to train a single ems component model"""

        x_to_train = x
        if custom_regressor is not None:
            # Check if class_arguments is a dictionary, otherwise treat it as a list or any other format
            if isinstance(custom_regressor_args, dict):
                model = custom_regressor(**custom_regressor_args)
            else:
                model = custom_regressor(*custom_regressor_args)

            # concat other columns to training frame
            if use_recursive_columns and recursive is not None:
                recursive_df = pd.concat(recursive, axis=1)
                recursive_df.columns = recursive_df.columns.get_level_values(1)
                x_to_train = x.join(pd.DataFrame.from_dict(recursive_df))

            model.fit(x_to_train, y)
        elif recursive is not None:
            r_c = str(y.name)
            model = RecursiveRandomForest(r_c, full_recursive=full_recursive, recursive_range=recursive_len,
                                          model_type=model_type)
            model.fit(x_to_train, recursive[r_c], y)
        else:
            model = sklearn.ensemble.RandomForestRegressor()
            model.fit(x_to_train, y)

        return model


class EmsComponentState(EmsComponent):
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int,
                 state_enable: list[str], switch_enable: list[str]) -> None:
        """instantiates a new ems component state"""

        self.state_enable = state_enable
        self.switch_enable = switch_enable
        super().__init__(name=name, power=power,
                         error=error, title=title, count=count)

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> EmsComponentState:
        """get an instance from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                t.append([key, val["power"], 1, 1, val["error"], val["title"],
                          val["state_enable"], val["switch_enable"]])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count,
                   state_enable=[r[6] for r in t],
                   switch_enable=[r[7] for r in t])

    def to_dict(self) -> dict[str, object]:
        """convert the instance to a dictionary"""

        components = {}
        for n, p, e, t, se, es in zip(self.name, self.power, self.error, self.title, self.state_enable,
                                      self.switch_enable):
            components[n] = {"power": p, "error": e, "title": t,
                             "state_enable": se, "switch_enable": es}

        return {"count": self.count, "components": components}


class EmsComponentTargetPower(EmsComponentState):
    """creates a new ems component target power instance"""

    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int,
                 state_enable: list[str], switch_enable: list[str], target_power: list[str]) -> None:
        super().__init__(name=name, power=power,
                         error=error, title=title, count=count,
                         state_enable=state_enable, switch_enable=switch_enable)
        self.target_power = target_power

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> EmsComponentTargetPower:
        """creates a new instance from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                t.append([key, val["power"], 1, 1, val["error"], val["title"],
                          val["state_enable"], val["switch_enable"], val["target_power"]])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count,
                   state_enable=[r[6] for r in t],
                   switch_enable=[r[7] for r in t],
                   target_power=[r[8] for r in t])

    def to_dict(self) -> dict[str, object]:
        """creates a dictionary representation of the object"""

        components = {}
        for n, p, e, t, se, es, tp in zip(self.name, self.power, self.error, self.title, self.state_enable,
                                          self.switch_enable, self.target_power):
            components[n] = {"power": p, "error": e, "title": t,
                             "state_enable": se, "switch_enable": es,
                             "target_power": tp}

        return {"count": self.count, "components": components}

    def get_data(self, start: int, end: int, project_id: str, agg: str = "avg") -> pd.DataFrame:
        """retrieves data for the ems component"""

        df = pd.DataFrame()
        for p, n, t in zip(self.power, self.name, self.target_power):
            if p != "" and not p.isdigit():
                data = fetch_data_from_http(
                    p, project_id, start, end, agg=agg, last_value_fill=True)
                df = append_data_to_dataframe_http(df, data, n + "_power")
            if t != "" and not t.isdigit():
                data = fetch_data_from_http(
                    t, project_id, start, end, agg=agg, last_value_fill=True)
                df = append_data_to_dataframe_http(df, data, n + "_tpow")
        if df.empty:
            return df
        else:
            return df.set_index("ts")


class PvComponent(EmsComponent):
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int) -> None:
        """creates a new pv component instance"""

        super().__init__(name=name, power=power,
                         error=error, title=title, count=count)

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> PvComponent:
        """creates a new pv component instance from a dictionary"""

        ems_component = super().from_dict(d)
        return PvComponent(ems_component.name, ems_component.power,
                           ems_component.error, ems_component.title, ems_component.count)

    def to_dict(self) -> dict[str, object]:
        """creates a dictionary from a pv component instance"""

        return super().to_dict()


class GeneratorComponent(EmsComponent):
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int,
                 state_reset: list[str], state_generator: list[str], enable_soc: list[str],
                 disable_soc: list[str], switch_enable: list[str],
                 switch_reset: list[str], state_enable: list[str]) -> None:
        """generates a generator component instance"""

        super().__init__(name=name, power=power,
                         error=error, title=title, count=count)

        self.state_reset = state_reset
        self.state_generator = state_generator
        self.enable_soc = enable_soc
        self.disable_soc = disable_soc
        self.switch_enable = switch_enable
        self.switch_reset = switch_reset
        self.state_enable = state_enable

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> GeneratorComponent:
        """get the component from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                t.append([key, val["power"], 1, 1, val["error"], val["title"],
                          val["state_reset"], val["state_generator"], val["enable_soc"], val["disable_soc"],
                          val["switch_reset"], val["switch_enable"], val["state_enable"]])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count,
                   state_reset=[r[6] for r in t],
                   state_generator=[r[7] for r in t],
                   enable_soc=[r[8] for r in t],
                   disable_soc=[r[9] for r in t],
                   switch_reset=[r[10] for r in t],
                   switch_enable=[r[11] for r in t],
                   state_enable=[r[12] for r in t])

    def to_dict(self) -> dict[str, object]:
        """convert the instance to a dictionary"""

        components = {}
        for n, p, e, t, sr, sg, es, ds, r, ens, ste in zip(self.name, self.power,
                                                           self.error, self.title,
                                                           self.state_reset, self.state_generator,
                                                           self.enable_soc, self.disable_soc,
                                                           self.switch_reset, self.switch_enable,
                                                           self.state_enable):
            components[n] = {"power": p, "error": e, "title": t,
                             "state_reset": sr, "state_generator": sg, "enable_soc": es, "disable_soc": ds,
                             "switch_reset": r, "switch_enable": ens, "state_enable": ste}

        return {"count": self.count, "components": components}


class GridComponent(EmsComponent):
    def __init__(self, name: list[str], power: list[str], error: list[str],
                 title: list[str], count: int, size: list[str], status_island: list[str]) -> None:
        """creates a new grid component"""

        super().__init__(name=name, power=power,
                         error=error, title=title, count=count)
        self.size = size
        self.status_island = status_island

    @classmethod
    def from_dict(cls, d) -> GridComponent:
        """creates a new instance from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                t.append([key, val["power"], 1, 1, val["error"], val["title"],
                          val["size"], val.get("status_island", "")])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count,
                   size=[r[6] for r in t],
                   status_island=[r[7] for r in t])

    def to_dict(self) -> dict[str, object]:
        """convert the instance to a dictionary"""

        components = {}
        for n, p, e, t, s, il in zip(self.name, self.power,
                                     self.error,
                                     self.title, self.size, self.status_island):
            components[n] = {"power": p, "error": e, "title": t,
                             "size": s, "status_island": il}

        return {"count": self.count, "components": components}


class BatteryComponent(EmsComponent):
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str],
                 count: int, soc: list[str], capacity: list[str], priority: list[str], target_power: list[str],
                 state_enable: list[str], state_reset: list[str], switch_enable: list[str], switch_reset: list[str],
                 size_capacity: list[str], status_bypass: list[str], soc_range_max: list[str], soc_range_min: list[str],
                 state_soc_range_max: list[str], state_soc_range_min: list[str], battery_standby_optimization_state: list[str],
                 battery_standby_optimization_mode: list[str], battery_standby_optimization_time_on: list[str],
                 battery_standby_optimization_time_off: list[str], battery_standby_optimization_power_on: list[str],
                 battery_standby_optimization_power_off: list[str]) -> None:
        """creates a new instance"""

        super().__init__(name=name, power=power,
                         error=error, title=title, count=count)
        self.capacity = capacity
        self.size_capacity = size_capacity
        self.soc = soc
        self.priority = priority
        self.target_power = target_power
        self.state_enable = state_enable
        self.state_reset = state_reset
        self.switch_enable = switch_enable
        self.switch_reset = switch_reset
        self.status_bypass = status_bypass
        self.soc_range_max = soc_range_max
        self.soc_range_min = soc_range_min
        self.state_soc_range_max = state_soc_range_max
        self.state_soc_range_min = state_soc_range_min
        self.battery_standby_optimization_state = battery_standby_optimization_state
        self.battery_standby_optimization_mode = battery_standby_optimization_mode
        self.battery_standby_optimization_time_on = battery_standby_optimization_time_on
        self.battery_standby_optimization_time_off = battery_standby_optimization_time_off
        self.battery_standby_optimization_power_on = battery_standby_optimization_power_on
        self.battery_standby_optimization_power_off = battery_standby_optimization_power_off

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> BatteryComponent:
        """create an instance from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                t.append([key, val["power"], 1, 1, val["error"], val["title"],
                          val["soc"], val["capacity"], val["priority"], val["target_power"],
                          val["state_enable"],
                          val["state_reset"], val["switch_enable"], val["switch_reset"], val["size_capacity"],
                          val.get("status_bypass", ""), val.get(
                              "soc_range_max", ""), val.get("soc_range_min", ""),
                          val.get("state_soc_range_max", ""), val.get(
                              "state_soc_range_min", ""),
                          val.get("battery_standby_optimization_state", ""), val.get(
                              "battery_standby_optimization_mode", ""),
                          val.get("battery_standby_optimization_time_on", ""), val.get(
                              "battery_standby_optimization_time_off", ""),
                          val.get("battery_standby_optimization_power_on", ""), val.get("battery_standby_optimization_power_off", ""),])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count,
                   soc=[r[6] for r in t],
                   capacity=[r[7] for r in t],
                   priority=[r[8] for r in t],
                   target_power=[r[9] for r in t],
                   state_enable=[r[10] for r in t],
                   state_reset=[r[11] for r in t],
                   switch_enable=[r[12] for r in t],
                   switch_reset=[r[13] for r in t],
                   size_capacity=[r[14] for r in t],
                   status_bypass=[r[15] for r in t],
                   soc_range_max=[r[16] for r in t],
                   soc_range_min=[r[17] for r in t],
                   state_soc_range_max=[r[18] for r in t],
                   state_soc_range_min=[r[19] for r in t],
                   battery_standby_optimization_state=[r[20] for r in t],
                   battery_standby_optimization_mode=[r[21] for r in t],
                   battery_standby_optimization_time_on=[r[22] for r in t],
                   battery_standby_optimization_time_off=[r[23] for r in t],
                   battery_standby_optimization_power_on=[r[24] for r in t],
                   battery_standby_optimization_power_off=[r[25] for r in t])

    def get_data(self, start: int, end: int, project_id: str, agg: str = "avg") -> pd.DataFrame:
        """retrieve data for the ems component"""

        df = pd.DataFrame()
        for p, n, s, t in zip(self.power, self.name, self.soc, self.target_power):
            if p != "":
                data = fetch_data_from_http(
                    p, project_id, start, end, agg=agg, last_value_fill=True)
                df = append_data_to_dataframe_http(df, data, n + "_power")
            if s != "":
                data = fetch_data_from_http(
                    s, project_id, start, end, agg=agg, last_value_fill=True)
                df = append_data_to_dataframe_http(df, data, n + "_soc")
            if t != "":
                data = fetch_data_from_http(
                    t, project_id, start, end, agg=agg, last_value_fill=True)
                df = append_data_to_dataframe_http(df, data, n + "_tpow")

        if df.empty:
            return df
        else:
            return df.set_index("ts")

    def to_dict(self) -> dict[str, object]:
        """convert the instance to a dictionary"""

        components = {}
        for n, p, e, t, soc, scp, pr, tp, se, sr, es, rb, sc, bp, sra, sri, ssra, ssri, bsos, bsom, bsoton, bsotoff, bsopon, bsopoff in zip(
            self.name,
            self.power,
            self.error,
            self.title,
            self.soc,
            self.capacity,
            self.priority,
            self.target_power,
            self.state_enable,
            self.state_reset,
            self.switch_enable,
            self.switch_reset,
            self.size_capacity,
            self.status_bypass,
            self.soc_range_max,
            self.soc_range_min,
            self.state_soc_range_max,
            self.state_soc_range_min,
            self.battery_standby_optimization_state,
            self.battery_standby_optimization_mode,
            self.battery_standby_optimization_time_on,
            self.battery_standby_optimization_time_off,
            self.battery_standby_optimization_power_on,
            self.battery_standby_optimization_power_off
        ):

            components[n] = {
                "power": p,
                "error": e,
                "title": t,
                "soc": soc,
                "capacity": scp,
                "priority": pr,
                "target_power": tp,
                "state_enable": se,
                "state_reset": sr,
                "switch_enable": es,
                "switch_reset": rb,
                "size_capacity": sc,
                "status_bypass": bp,
                "soc_range_max": sra,
                "soc_range_min": sri,
                "state_soc_range_max": ssra,
                "state_soc_range_min": ssri,
                "battery_standby_optimization_state": bsos,
                "battery_standby_optimization_mode": bsom,
                "battery_standby_optimization_time_on": bsoton,
                "battery_standby_optimization_time_off": bsotoff,
                "battery_standby_optimization_power_on": bsopon,
                "battery_standby_optimization_power_off": bsopoff
            }

        return {"count": self.count, "components": components}

    def get_cap(self, project_id: str) -> float:
        """get the total capacity of the battery component"""

        result = 0
        for name in self.capacity:
            result += fetch_last_value(name, project_id)
        return result

    def get_latest_soc(self, project_id: str) -> float:
        """get the latest soc of the battery component"""

        result = 0
        for name in self.soc:
            result += fetch_last_value(name, project_id)
        return result

    def get_max_cap(self, project_id: str) -> float:
        """get the total size capacity of the battery component"""

        result = 0
        for name in self.size_capacity:
            result += fetch_last_value(name, project_id)
        return result


class HouseComponent(EmsComponentState):
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int,
                 state_enable: list[str], switch_enable: list[str]) -> None:
        """creates a new instance"""

        super().__init__(name=name, power=power,
                         error=error, title=title, count=count, state_enable=state_enable,
                         switch_enable=switch_enable)

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> HouseComponent:
        """creates a new instance from a dictionary"""

        ems_component_state = super().from_dict(d)
        return HouseComponent(ems_component_state.name, ems_component_state.power, ems_component_state.error,
                              ems_component_state.title, ems_component_state.count, ems_component_state.state_enable,
                              ems_component_state.switch_enable)

    def to_dict(self) -> dict[str, object]:
        """creates a dictionary from the instance"""

        return super().to_dict()


class ChargeStationComponent(EmsComponentTargetPower):
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int,
                 car_connected: list[str], charging_time: list[str], state_charging_station: list[str],
                 state_emergency: list[str], state_manual: list[str], min_power: list[str],
                 switch_emergency: list[str], priority: list[str], enable_soc: list[str], disable_soc: list[str],
                 max_power: list[str], slider_manual: list[str], slider_min_power: list[str], target_power: list[str],
                 state_enable: list[str], slider_target_power: list[str], switch_enable: list[str],
                 switch_manual: list[str]) -> None:
        """creates a new instance"""

        super().__init__(name=name, power=power,
                         error=error, title=title, count=count, state_enable=state_enable, switch_enable=switch_enable,
                         target_power=target_power)
        self.car_connected = car_connected
        self.charging_time = charging_time
        self.state_charging_station = state_charging_station
        self.state_manual = state_manual
        self.state_emergency = state_emergency
        self.min_power = min_power
        self.switch_emergency = switch_emergency
        self.priority = priority
        self.enable_soc = enable_soc
        self.disable_soc = disable_soc
        self.max_power = max_power
        self.slider_manual = slider_manual
        self.slider_min_power = slider_min_power
        self.slider_target_power = slider_target_power
        self.switch_manual = switch_manual

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> ChargeStationComponent:
        """creates a new instance from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                t.append([key, val["power"], 1, 1, val["error"], val["title"],
                          val["car_connected"], val["charging_time"], val["state_charging_station"],
                          val["state_emergency"],
                          val["state_manual"], 5, val["min_power"], val["switch_emergency"],
                          val["priority"], val["enable_soc"], val["disable_soc"], val["max_power"],
                          val["slider_manual"],
                          val["slider_min_power"], val["slider_target_power"], val["switch_enable"],
                          val["switch_manual"],
                          val["target_power"], val["state_enable"]])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count,
                   car_connected=[r[6] for r in t],
                   charging_time=[r[7] for r in t],
                   state_charging_station=[r[8] for r in t],
                   state_emergency=[r[9] for r in t],
                   state_manual=[r[10] for r in t],
                   min_power=[r[12] for r in t],
                   switch_emergency=[r[13] for r in t],
                   priority=[r[14] for r in t],
                   enable_soc=[r[15] for r in t],
                   disable_soc=[r[16] for r in t],
                   max_power=[r[17] for r in t],
                   slider_manual=[r[18] for r in t],
                   slider_min_power=[r[19] for r in t],
                   slider_target_power=[r[20] for r in t],
                   switch_enable=[r[21] for r in t],
                   switch_manual=[r[22] for r in t],
                   target_power=[r[23] for r in t],
                   state_enable=[r[24] for r in t])

    def to_dict(self) -> dict[str, object]:
        """creates a dictionary from the instance"""

        components = {}
        for n, p, e, t, cc, ct, s, es, ms, \
                mip, eb, pr, ens, dis, mxp, msl, slp, tp, se, stp, swe, swm in zip(self.name,
                                                                                   self.power,
                                                                                   self.error,
                                                                                   self.title,
                                                                                   self.car_connected,
                                                                                   self.charging_time,
                                                                                   self.state_charging_station,
                                                                                   self.state_emergency,
                                                                                   self.state_manual,
                                                                                   self.min_power,
                                                                                   self.switch_emergency,
                                                                                   self.priority,
                                                                                   self.enable_soc,
                                                                                   self.disable_soc,
                                                                                   self.max_power,
                                                                                   self.slider_manual,
                                                                                   self.slider_min_power,
                                                                                   self.target_power,
                                                                                   self.state_enable,
                                                                                   self.slider_target_power,
                                                                                   self.switch_enable,
                                                                                   self.switch_manual):
            components[n] = {"power": p, "error": e, "title": t,
                             "car_connected": cc, "charging_time": ct, "state_charging_station": s,
                             "state_emergency": es, "state_enable": se,
                             "state_manual": ms, "min_power": mip, "switch_emergency": eb,
                             "priority": pr, "enable_soc": ens, "disable_soc": dis, "max_power": mxp,
                             "slider_manual": msl, "slider_min_power": slp, "target_power": tp,
                             "slider_target_power": stp, "switch_enable": swe, "switch_manual": swm}

        return {"count": self.count, "components": components}


class ElectricHeatingComponent(EmsComponentTargetPower):
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int,
                 temperature: list[str], state_electric_heating: list[str], state_emergency: list[str],
                 state_manual: list[str], state_time: list[str], state_disable_protection: list[str],
                 switch_emergency: list[str], priority: list[str], enable_soc: list[str], disable_soc: list[str],
                 switch_disable_protection: list[str], switch_manual: list[str], slider_target_power: list[str],
                 switch_time: list[str], hour_on: list[str], minute_on: list[str], hour_off: list[str],
                 minute_off: list[str], target_temp_on: list[str], target_temp_off: list[str],
                 target_temp_max: list[str], switch_enable: list[str], max_power: list[str], target_power: list[str],
                 state_enable: list[str], slider_manual: list[str]) -> None:
        """creates a new instance"""

        super().__init__(name=name, power=power,
                         error=error, title=title, count=count, state_enable=state_enable, switch_enable=switch_enable,
                         target_power=target_power)
        self.temperature = temperature
        self.state_electric_heating = state_electric_heating
        self.state_emergency = state_emergency
        self.state_manual = state_manual
        self.state_time = state_time
        self.state_disable_protection = state_disable_protection
        self.switch_emergency = switch_emergency
        self.priority = priority
        self.enable_soc = enable_soc
        self.disable_soc = disable_soc
        self.switch_disable_protection = switch_disable_protection
        self.switch_manual = switch_manual
        self.slider_target_power = slider_target_power
        self.switch_time = switch_time
        self.hour_on = hour_on
        self.minute_on = minute_on
        self.hour_off = hour_off
        self.minute_off = minute_off
        self.target_temp_on = target_temp_on
        self.target_temp_off = target_temp_off
        self.target_temp_max = target_temp_max
        self.max_power = max_power
        self.slider_manual = slider_manual

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> ElectricHeatingComponent:
        """generates a new instance from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                t.append([key, val["power"], 1, 1, val["error"], val["title"],
                          val["temperature"], val["state_electric_heating"], val["state_emergency"],
                          val["state_manual"],
                          5, val["state_time"], val["state_disable_protection"], val["switch_emergency"],
                          val["priority"], val["enable_soc"], val["disable_soc"], val["switch_disable_protection"],
                          val["switch_manual"], val["slider_target_power"], val["switch_time"], val["hour_on"],
                          val["minute_on"],
                          val["hour_off"], val["minute_off"], val["target_temp_on"], val["target_temp_off"],
                          val["target_temp_max"],
                          val["switch_enable"], val["max_power"], val["target_power"], val["state_enable"],
                          val["slider_manual"]])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count,
                   temperature=[r[6] for r in t],
                   state_electric_heating=[r[7] for r in t],
                   state_emergency=[r[8] for r in t],
                   state_manual=[r[9] for r in t],
                   state_time=[r[11] for r in t],
                   state_disable_protection=[r[12] for r in t],
                   switch_emergency=[r[13] for r in t],
                   priority=[r[14] for r in t],
                   enable_soc=[r[15] for r in t],
                   disable_soc=[r[16] for r in t],
                   switch_disable_protection=[r[17] for r in t],
                   switch_manual=[r[18] for r in t],
                   slider_target_power=[r[19] for r in t],
                   switch_time=[r[20] for r in t],
                   hour_on=[r[21] for r in t],
                   minute_on=[r[22] for r in t],
                   hour_off=[r[23] for r in t],
                   minute_off=[r[24] for r in t],
                   target_temp_on=[r[25] for r in t],
                   target_temp_off=[r[26] for r in t],
                   target_temp_max=[r[27] for r in t],
                   switch_enable=[r[28] for r in t],
                   max_power=[r[29] for r in t],
                   target_power=[r[30] for r in t],
                   state_enable=[r[31] for r in t],
                   slider_manual=[r[32] for r in t])

    def to_dict(self) -> dict[str, object]:
        """get a dictionary from the instance"""

        components = {}
        for n, p, e, t, temp, s, es, ms, ts, dp, eb, pr, ens, \
                dis, dbp, mb, slp, tb, hon, mon, hof, \
                mof, ton, tof, tm, sw, mxp, tp, se, sm in zip(self.name,
                                                              self.power,
                                                              self.error,
                                                              self.title,
                                                              self.temperature,
                                                              self.state_electric_heating,
                                                              self.state_emergency,
                                                              self.state_manual,
                                                              self.state_time,
                                                              self.state_disable_protection,
                                                              self.switch_emergency,
                                                              self.priority,
                                                              self.enable_soc,
                                                              self.disable_soc,
                                                              self.switch_disable_protection,
                                                              self.switch_manual,
                                                              self.slider_target_power,
                                                              self.switch_time,
                                                              self.hour_on,
                                                              self.minute_on,
                                                              self.hour_off,
                                                              self.minute_off,
                                                              self.target_temp_on,
                                                              self.target_temp_off,
                                                              self.target_temp_max,
                                                              self.switch_enable,
                                                              self.max_power,
                                                              self.target_power,
                                                              self.state_enable,
                                                              self.slider_manual):
            components[n] = {"power": p, "error": e, "title": t,
                             "temperature": temp, "state_electric_heating": s, "state_emergency": es,
                             "state_manual": ms, "state_time": ts, "state_disable_protection": dp,
                             "switch_emergency": eb, "priority": pr, "enable_soc": ens, "disable_soc": dis,
                             "switch_disable_protection": dbp, "switch_manual": mb, "slider_target_power": slp,
                             "switch_time": tb, "hour_on": hon, "minute_on": mon, "hour_off": hof, "minute_off": mof,
                             "target_temp_on": ton, "target_temp_off": tof, "target_temp_max": tm,
                             "switch_enable": sw, "max_power": mxp, "target_power": tp, "state_enable": se,
                             "slider_manual": sm}

        return {"count": self.count, "components": components}


class HeatingPumpComponent(EmsComponentTargetPower):
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int,
                 state_reset: list[str], state_heating_pump: list[str], state_emergency: list[str],
                 state_manual: list[str], manual_power: list[str], state_time: list[str],
                 state_time_power: list[str], flow_temperature: list[str], return_temperature: list[str],
                 inlet_temperature: list[str], outlet_temperature: list[str], boiler_temperature: list[str],
                 boiler_water_temperature: list[str], switch_emergency: list[str], priority: list[str],
                 enable_soc: list[str], disable_soc: list[str], switch_reset: list[str], switch_manual: list[str],
                 target_power: list[str], switch_time: list[str], slider_power: list[str], hour_on: list[str],
                 minute_on: list[str], hour_off: list[str], minute_off: list[str], max_power: list[dict[str, str]],
                 switch_enable: list[str], slider_manual: list[str], state_enable: list[str]) -> None:
        """creates a new instance"""

        super().__init__(name=name, power=power,
                         error=error, title=title, count=count, state_enable=state_enable, switch_enable=switch_enable,
                         target_power=target_power)
        self.state_reset = state_reset
        self.state_heating_pump = state_heating_pump
        self.state_emergency = state_emergency
        self.state_manual = state_manual
        self.manual_power = manual_power
        self.state_time = state_time
        self.state_time_power = state_time_power
        self.flow_temperature = flow_temperature
        self.return_temperature = return_temperature
        self.inlet_temperature = inlet_temperature
        self.outlet_temperature = outlet_temperature
        self.boiler_temperature = boiler_temperature
        self.boiler_water_temperature = boiler_water_temperature
        self.switch_emergency = switch_emergency
        self.priority = priority
        self.enable_soc = enable_soc
        self.disable_soc = disable_soc
        self.switch_reset = switch_reset
        self.switch_manual = switch_manual
        self.switch_time = switch_time
        self.slider_power = slider_power
        self.hour_on = hour_on
        self.minute_on = minute_on
        self.hour_off = hour_off
        self.minute_off = minute_off
        self.max_power = max_power
        self.slider_manual = slider_manual

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> HeatingPumpComponent:
        """creates a new instance from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                t.append([key, val["power"], 1, 1, val["error"], val["title"],
                          val["state_reset"], val["state_heating_pump"], val["state_emergency"], val["state_manual"],
                          val["manual_power"], val["state_time"], val["state_time_power"], val["flow_temperature"],
                          val["return_temperature"], val["inlet_temperature"], val["outlet_temperature"],
                          val["boiler_temperature"], val["boiler_water_temperature"], val["switch_emergency"],
                          val["priority"], val["enable_soc"], val["disable_soc"], val["switch_reset"],
                          val["switch_manual"], val["target_power"], val["switch_time"], val["slider_power"],
                          val["hour_on"], val["minute_on"], val["hour_off"], val["minute_off"], val["max_power"],
                          val["switch_enable"], val["slider_manual"], val["state_enable"]])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count,
                   state_reset=[r[6] for r in t],
                   state_heating_pump=[r[7] for r in t],
                   state_emergency=[r[8] for r in t],
                   state_manual=[r[9] for r in t],
                   manual_power=[r[10] for r in t],
                   state_time=[r[11] for r in t],
                   state_time_power=[r[12] for r in t],
                   flow_temperature=[r[13] for r in t],
                   return_temperature=[r[14] for r in t],
                   inlet_temperature=[r[15] for r in t],
                   outlet_temperature=[r[16] for r in t],
                   boiler_temperature=[r[17] for r in t],
                   boiler_water_temperature=[r[18] for r in t],
                   switch_emergency=[r[19] for r in t],
                   priority=[r[20] for r in t],
                   enable_soc=[r[21] for r in t],
                   disable_soc=[r[22] for r in t],
                   switch_reset=[r[23] for r in t],
                   switch_manual=[r[24] for r in t],
                   target_power=[r[25] for r in t],
                   switch_time=[r[26] for r in t],
                   slider_power=[r[27] for r in t],
                   hour_on=[r[28] for r in t],
                   minute_on=[r[29] for r in t],
                   hour_off=[r[30] for r in t],
                   minute_off=[r[31] for r in t],
                   max_power=[r[32] for r in t],
                   switch_enable=[r[33] for r in t],
                   slider_manual=[r[34] for r in t],
                   state_enable=[r[35] for r in t])

    def to_dict(self) -> dict[str, object]:
        """creates a dictionary from the instance"""

        components = {}
        for n, p, e, t, srb, s, es, ms, mp, ts, tsp, ft, rt, it, ot, bt, bwt, eb, pr, ens, \
                dis, rb, mb, slp, tb, sldp, hon, mon, hof, mof, mxp, se, sm, ste in zip(self.name,
                                                                                        self.power,
                                                                                        self.error,
                                                                                        self.title,
                                                                                        self.state_reset,
                                                                                        self.state_heating_pump,
                                                                                        self.state_emergency,
                                                                                        self.state_manual,
                                                                                        self.manual_power,
                                                                                        self.state_time,
                                                                                        self.state_time_power,
                                                                                        self.flow_temperature,
                                                                                        self.return_temperature,
                                                                                        self.inlet_temperature,
                                                                                        self.outlet_temperature,
                                                                                        self.boiler_temperature,
                                                                                        self.boiler_water_temperature,
                                                                                        self.switch_emergency,
                                                                                        self.priority,
                                                                                        self.enable_soc,
                                                                                        self.disable_soc,
                                                                                        self.switch_reset,
                                                                                        self.switch_manual,
                                                                                        self.target_power,
                                                                                        self.switch_time,
                                                                                        self.slider_power,
                                                                                        self.hour_on,
                                                                                        self.minute_on,
                                                                                        self.hour_off,
                                                                                        self.minute_off,
                                                                                        self.max_power,
                                                                                        self.switch_enable,
                                                                                        self.slider_manual,
                                                                                        self.state_enable):
            components[n] = {"power": p, "error": e, "title": t,
                             "state_reset": srb, "state_heating_pump": s, "state_emergency": es,
                             "state_manual": ms, "manual_power": mp, "state_time": ts, "state_time_power": tsp,
                             "flow_temperature": ft, "return_temperature": rt, "inlet_temperature": it,
                             "outlet_temperature": ot, "boiler_temperature": bt, "boiler_water_temperature": bwt,
                             "switch_emergency": eb, "priority": pr, "enable_soc": ens, "disable_soc": dis,
                             "switch_reset": rb, "switch_manual": mb, "target_power": slp,
                             "slider_power": sldp,
                             "switch_time": tb, "hour_on": hon, "minute_on": mon, "hour_off": hof, "minute_off": mof,
                             "max_power": mxp, "switch_enable": se, "slider_manual": sm, "state_enable": ste}

        return {"count": self.count, "components": components}


class BigConsumerComponent(EmsComponentTargetPower):
    def __init__(self, name: list[str], power: list[str], error: list[str], title: list[str], count: int,
                 state_consumer: list[str], state_emergency: list[str], state_manual: list[str],
                 switch_emergency: list[str], priority: list[str], enable_soc: list[str], disable_soc: list[str],
                 switch_manual: list[str], state_enable: list[str], target_power: list[str], switch_enable: list[str],
                 slider_manual: list[str], slider_target_power: list[str], max_power: list[str]) -> None:
        """creates a new instance"""

        super().__init__(name=name, power=power,
                         error=error, title=title, count=count,
                         state_enable=state_enable, switch_enable=switch_enable, target_power=target_power)
        self.state_consumer = state_consumer
        self.state_emergency = state_emergency
        self.state_manual = state_manual
        self.switch_emergency = switch_emergency
        self.priority = priority
        self.enable_soc = enable_soc
        self.disable_soc = disable_soc
        self.switch_manual = switch_manual
        self.slider_manual = slider_manual
        self.slider_target_power = slider_target_power
        self.max_power = max_power

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> BigConsumerComponent:
        """creates a new instance from a dictionary"""

        t = []
        components = d["components"]
        if isinstance(components, dict):
            for key, val in components.items():
                if "max_power" in val:
                    mp = val["max_power"]
                else:
                    mp = {}
                t.append([key, val["power"], 1, 1, val["error"], val["title"],
                          val["state_consumer"], val["state_emergency"], val["state_manual"], val["switch_emergency"],
                          val["priority"], val["enable_soc"], val["disable_soc"], val["switch_manual"],
                          val["state_enable"], val["target_power"], val["switch_enable"], val["slider_manual"],
                          val["slider_target_power"], mp])
        count = d["count"]
        if not isinstance(count, int):
            count = len(t)

        return cls(name=[r[0] for r in t],
                   power=[r[1] for r in t],
                   error=[r[4] for r in t],
                   title=[r[5] for r in t],
                   count=count,
                   state_consumer=[r[6] for r in t],
                   state_emergency=[r[7] for r in t],
                   state_manual=[r[8] for r in t],
                   switch_emergency=[r[9] for r in t],
                   priority=[r[10] for r in t],
                   enable_soc=[r[11] for r in t],
                   disable_soc=[r[12] for r in t],
                   switch_manual=[r[13] for r in t],
                   state_enable=[r[14] for r in t],
                   target_power=[r[15] for r in t],
                   switch_enable=[r[16] for r in t],
                   slider_manual=[r[17] for r in t],
                   slider_target_power=[r[18] for r in t],
                   max_power=[r[19] for r in t])

    def to_dict(self) -> dict[str, object]:
        """converts the instance to a dictionary"""

        components = {}
        for n, p, e, t, s, es, ms, eb, pr, ens, dis, mb, se, tp, swe, sm, stp, mp in zip(self.name,
                                                                                         self.power,
                                                                                         self.error,
                                                                                         self.title,
                                                                                         self.state_consumer,
                                                                                         self.state_emergency,
                                                                                         self.state_manual,
                                                                                         self.switch_emergency,
                                                                                         self.priority,
                                                                                         self.enable_soc,
                                                                                         self.disable_soc,
                                                                                         self.switch_manual,
                                                                                         self.state_enable,
                                                                                         self.target_power,
                                                                                         self.switch_enable,
                                                                                         self.slider_manual,
                                                                                         self.slider_target_power,
                                                                                         self.max_power
                                                                                         ):
            components[n] = {"power": p, "error": e, "title": t,
                             "state_consumer": s, "state_emergency": es, "state_manual": ms, "switch_emergency": eb,
                             "priority": pr, "enable_soc": ens, "disable_soc": dis, "switch_manual": mb,
                             "state_enable": se, "target_power": tp, "switch_enable": swe, "slider_manual": sm,
                             "slider_target_power": stp, "max_power": mp}

        return {"count": self.count, "components": components}


class EmsRule:
    def __init__(self, name: list[str], warning_rule: list[str], error_rule: list[str]) -> None:
        """creates a new instance"""

        self.name = name
        self.warning_rule = warning_rule
        self.error_rule = error_rule

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> EmsRule:
        """creates an ems rule from a dictionary"""

        names = []
        error_rules = []
        warning_rules = []
        for key, val in d.items():
            if isinstance(val, dict):
                names.append(key)
                error_rules.append(val["errorRule"])
                warning_rules.append(val["warningRule"])
        return cls(name=names, warning_rule=warning_rules, error_rule=error_rules)

    def to_dict(self) -> dict[str, object]:
        """creates a dictionary from an instance"""

        result = {}
        for n, er, wr in zip(self.name, self.error_rule, self.warning_rule):
            result[n] = {"errorRule": er, "warningRule": wr}

        return result
