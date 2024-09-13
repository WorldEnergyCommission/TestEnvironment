import logging
import time
from typing import Union

import gekko
import numpy as np
import pandas as pd

from ai.utils.mqtt_utils import get_cloud_to_device_mqtt_topic, publish_to_http


def get_devices_sum(devices: list[list[float]], length: int)->list[float]:
    """ get sum for each timestamp for a list of devices. Device length must match"""

    y_sum = [0]*length
    for device in devices:
        if not device:
            continue
        y_sum += sum(device)
    
    return y_sum


def consumer_correction(consumers: list[list[float]], y_consumption: [float])->list[list[float]]:
    """corrects the list of consumers to match y_consumption for each timestamp. 
        length of devices and y_consumption must match"""
                
    y_consumption_sum = get_devices_sum(consumers, len(y_consumption))

    diff = y_consumption_sum - y_consumption

    for i in range(len(y_consumption)):
        if diff[i] == 0:
            continue
        for consumer in consumers:
            for entity in consumer:
                entity[i] -= (entity[i]/y_consumption_sum[i])*diff[i]

    return consumers


def optimize_battery_power(
        grid: np.array, r: int, capacities: list[list[float | bool]], start_idxs: list[int], end_idxs: list[int],
        weights: np.array, offset: float = 0) -> np.array:
    """optimize battery power for the given price"""

    m = gekko.GEKKO(remote=False)
    m.options.IMODE = 2

    g = m.Array(m.Param, r)
    p = m.Array(m.Param, r)
    for i in range(r):
        g[i].value = grid[:, i]
        p[i].value = weights[:, i]

    b = m.Array(m.Var, r)
    dif = m.Array(m.Var, r)
    e = m.Array(m.Var, r)
    off = m.Param(value=offset)

    cap = m.Array(m.Param, r)

    for i in range(r):
        cap[i].value = capacities[i][0]

    eq = []

    for i in range(r):
        if capacities[i][1]:
            eq1 = cap[i] > (m.vsum(b[i]) * 0.25)
        else:
            eq1 = ((cap[i] + cap[i - 1]) - ((m.vsum(b[i - 1]))
                                            * 0.25)) > ((m.vsum(b[i])) * 0.25)

        eq2 = b[i] >= 0
        eq3 = dif[i] == ((g[i] - b[i] + off) ** 2) * p[i]
        eq4 = e[i] == m.vsum(dif[i])

        eq.append(eq1)
        eq.append(eq2)
        eq.append(eq3)
        eq.append(eq4)

    m.Equations(eq)

    m.Obj(sum(e))
    m.solve(disp=False)

    final = np.zeros(97)
    offset = 0

    if not start_idxs:
        final = np.array(b[0])
        return final[:-1]

    for i in range(len(start_idxs)):
        if (i == 0) and (len(start_idxs) == 1):
            if start_idxs[i] == 0:
                final[end_idxs[i]:] = np.array(b[i])[end_idxs[i]:]
            elif end_idxs[i] == len(grid):
                final[:start_idxs[i]] = np.array(b[i])[:start_idxs[i]]
            else:
                final[:start_idxs[i]] = np.array(b[i])[:start_idxs[i]]
                final[end_idxs[i]:] = np.array(b[i + 1])[end_idxs[i]:]
            break
        elif i == 0:
            if start_idxs[i] != 0:
                final[:start_idxs[i]] = np.array(b[i])[:start_idxs[i]]
                final[end_idxs[i]:start_idxs[i + 1]] = np.array(b[i + 1])[end_idxs[i]:start_idxs[i + 1]]
                offset = 1
            else:
                final[end_idxs[i]:start_idxs[i + 1]] = np.array(b[i])[end_idxs[i]:start_idxs[i + 1]]
        elif i == len(start_idxs) - 1:
            if end_idxs[i] == len(grid):
                continue
            else:
                final[end_idxs[i]:] = np.array(b[i + offset])[end_idxs[i]:]
        else:
            final[end_idxs[i]:start_idxs[i + 1]] = np.array(b[i + offset])[end_idxs[i]:start_idxs[i + 1]]
    return final[:-1]


def calculate_loading_phase(con: np.array, offset: float = 0) -> tuple[list[int], list[int]]:
    """calculate the loading phases according to the consumption"""

    start_loading = []
    end_loading = []
    for i, c in enumerate(con):
        if i == 0:
            if (c + offset) < -0.1:
                start_loading.append(0)
            elif ((c + offset) > -0.1) and ((con[i + 1] + offset) < -0.1):
                start_loading.append(1)

            if ((c + offset) < -0.1) and ((con[i + 1] + offset) > -0.1):
                end_loading.append(1)
        elif i == (len(con) - 1):
            if (c + offset) < -0.1:
                end_loading.append(i + 1)
        else:
            if ((c + offset) <= - 0.1) and ((con[i + 1] + offset) >= -0.1):
                end_loading.append(i + 1)
            elif ((c + offset) >= -0.1) and ((con[i + 1] + offset) <= -0.1):
                start_loading.append(i + 1)

    return start_loading, end_loading


def calculate_capacities(
        con: np.array, start_loading: list[int], end_loading: list[int], cap: float, max_cap: float,
        max_charge: float, reserve_capacity: float, offset: float = 0) -> list[list[float | bool]]:
    """calculate the capacity of the battery using the passed arguments"""

    capacities = []
    c_cap = cap

    if not start_loading:
        capacities = [[c_cap, True]]
        return capacities

    for i in range(len(start_loading)):
        if i == 0:
            if start_loading[i] != 0:
                capacities = [[cap, True]]
                c_cap = 0

        if i == len(start_loading) - 1:
            if end_loading[i] == len(con):
                continue
        flag = False

        for p in (con[start_loading[i]:end_loading[i]] + offset):
            if p < max_charge:
                c_cap -= max_charge * 0.25
            else:
                c_cap -= p * 0.25
            if c_cap > (max_cap - reserve_capacity):
                flag = True
                c_cap = (max_cap - reserve_capacity)

        capacities.append([c_cap, flag])
        c_cap = 0
    return capacities


def format_grid_for_optimization(
        con: np.array, start_loading: list[int], end_loading: list[int],
        price: Union[np.array, pd.Series]) -> tuple[np.array, np.array]:
    """prepare two arrays that are used for the optimization"""

    g = []
    p = []

    if not start_loading:
        grid = np.zeros((97, 1))
        weights = np.ones((97, 1))

        grid[:, 0] = con.copy()
        weights[:, 0] = price.copy()
        return grid, weights

    for i in range(len(start_loading)):
        if (i == 0) and (len(start_loading) == 1):
            if start_loading[i] == 0:
                g.append(con[end_loading[i]:])
                p.append(price[end_loading[i]:])
            elif end_loading[i] == len(con):
                g.append(con[:start_loading[i]])
                p.append(price[:start_loading[i]])
            else:
                g.append(con[:start_loading[i]])
                g.append(con[end_loading[i]:])
                p.append(price[:start_loading[i]])
                p.append(price[end_loading[i]:])
        elif i == 0:
            if start_loading[i] != 0:
                g.append(con[:start_loading[i]])
                p.append(price[:start_loading[i]])
                g.append(con[end_loading[i]:start_loading[i + 1]])
                p.append(price[end_loading[i]:start_loading[i + 1]])
            else:
                g.append(con[end_loading[i]:start_loading[i + 1]])
                p.append(price[end_loading[i]:start_loading[i + 1]])
        elif i == len(start_loading) - 1:
            if end_loading[i] == len(con):
                continue
            else:
                g.append(con[end_loading[i]:])
                p.append(price[end_loading[i]:])
        else:
            g.append(con[end_loading[i]:start_loading[i + 1]])
            p.append(price[end_loading[i]:start_loading[i + 1]])

    grid = np.zeros((97, len(g)))
    weights = np.ones((97, len(p)))

    offset = 0
    for i in range(len(start_loading)):
        if (len(start_loading) == 1) and (i == 0):
            if start_loading[i] == 0:
                grid[end_loading[i]:, i] = g[i]
                weights[end_loading[i]:, i] = p[i]
            elif end_loading[i] == len(con):
                grid[:start_loading[i], i] = g[i]
                weights[:start_loading[i], i] = p[i]
            else:
                grid[:start_loading[i], i] = g[i]
                grid[end_loading[i]:, i + 1] = g[i + 1]
                weights[:start_loading[i], i] = p[i]
                weights[end_loading[i]:, i + 1] = p[i + 1]
        elif i == 0:
            if start_loading[i] != 0:
                grid[:start_loading[i], i] = g[i]
                grid[end_loading[i]:start_loading[i + 1], i + 1] = g[i + 1]
                weights[:start_loading[i], i] = p[i]
                weights[end_loading[i]:start_loading[i + 1], i + 1] = p[i + 1]
                offset = 1
            else:
                grid[end_loading[i]:start_loading[i + 1], i] = g[i]
                weights[end_loading[i]:start_loading[i + 1], i] = p[i]
        elif i == len(start_loading) - 1:
            if end_loading[i] == len(con):
                continue
            else:
                grid[end_loading[i]:, i + offset] = g[i + offset]
                weights[end_loading[i]:, i + offset] = p[i + offset]
        else:
            grid[end_loading[i]:start_loading[i + 1], i + offset] = g[i + offset]
            weights[end_loading[i]:start_loading[i + 1], i + offset] = p[i + offset]
    return grid, weights


def calculate_battery_prediction(
        con: np.array, max_charge: float, current_cap: float, reserve_cap: float, max_cap: float,
        pos_bat_pow: np.array, offset: float = 0) -> tuple[np.array, np.array, np.array]:
    """calculate the battery prediction using the optimized battery power values"""

    final_bat_power = np.zeros_like(pos_bat_pow)
    final_soc = np.zeros_like(pos_bat_pow)
    final_cap = np.zeros_like(pos_bat_pow)

    soc_to_add = current_cap / max_cap * 100
    min_soc = reserve_cap / max_cap
    cap_to_add = current_cap

    for i in range(len(pos_bat_pow)):
        if pos_bat_pow[i] > 0:
            final_bat_power[i] = pos_bat_pow[i]
            soc_to_add = soc_to_add - pos_bat_pow[i] * 0.25 / max_cap * 100
            if soc_to_add > 100:
                soc_to_add = 100
            elif soc_to_add < min_soc:
                soc_to_add = min_soc
            final_soc[i] = soc_to_add

            cap_to_add = cap_to_add - pos_bat_pow[i] * 0.25

            if cap_to_add > max_cap:
                cap_to_add = max_cap
            elif cap_to_add < reserve_cap:
                cap_to_add = reserve_cap

            final_cap[i] = cap_to_add
        else:
            if soc_to_add == 100:
                final_bat_power[i] = 0
                final_soc[i] = 100
                final_cap[i] = max_cap
            else:
                if (con[i] + offset) < 0:
                    if (con[i] + offset) < max_charge:
                        if (-max_charge * 0.25 + cap_to_add) > max_cap:
                            final_bat_power[i] = - (max_cap - cap_to_add) * 4
                        else:
                            final_bat_power[i] = max_charge

                        cap_to_add = cap_to_add - final_bat_power[i] * 0.25

                        soc_to_add = soc_to_add - final_bat_power[i] * 0.25 / max_cap * 100
                    else:
                        if (-(con[i] + offset) * 0.25 + cap_to_add) > max_cap:
                            final_bat_power[i] = - (max_cap - cap_to_add) * 4
                        else:
                            final_bat_power[i] = con[i] + offset
                        cap_to_add = cap_to_add - final_bat_power[i] * 0.25
                        soc_to_add = soc_to_add - final_bat_power[i] * 0.25 / max_cap * 100

                    if cap_to_add > max_cap:
                        cap_to_add = max_cap
                    elif cap_to_add < reserve_cap:
                        cap_to_add = reserve_cap

                    if soc_to_add > 100:
                        soc_to_add = 100
                    elif soc_to_add < min_soc:
                        soc_to_add = min_soc

                    final_cap[i] = cap_to_add
                    final_soc[i] = soc_to_add
                else:
                    final_cap[i] = cap_to_add
                    final_soc[i] = soc_to_add
                    final_bat_power[i] = 0

    return final_bat_power, final_soc, final_cap


def get_prices(energy_price: dict[str, str | int], x: pd.DataFrame, mode: int = 2) -> Union[np.array, pd.Series]:
    """get the energy prices for the corresponding timeframe"""

    if energy_price == {} or mode == 0:
        return np.ones(len(x))

    if mode == 2:
        factor = 10
    else:
        factor = 1

    (start_low_hour, end_low_hour, start_high_hour, end_high_hour,
     start_low_min, end_low_min, start_high_min, end_high_min) = get_energy_price_time(energy_price)

    low_price = energy_price["price_low"]
    high_price = energy_price["price_high"]

    if low_price > high_price:
        low_price *= factor
    else:
        high_price *= factor

    if start_low_hour < end_low_hour:
        # noinspection PyUnresolvedReferences
        x["is_low"] = ((start_low_hour < x.index.hour) & (x.index.hour < end_low_hour)) | \
                      ((start_low_hour == x.index.hour) & (start_low_min < x.index.minute)) | \
                      ((end_low_hour == x.index.hour) &
                       (end_low_min > x.index.minute))

    else:
        # noinspection PyUnresolvedReferences
        x["is_low"] = (start_low_hour < x.index.hour) | \
                      (end_low_hour > x.index.hour) | \
                      ((start_low_hour == x.index.hour) & (start_low_min < x.index.minute)) | \
                      ((end_low_hour == x.index.hour) &
                       (end_low_min > x.index.minute))

    x["price"] = x["is_low"] * low_price + (1 - x["is_low"]) * high_price

    price = x["price"]

    x.drop(["is_low", "price"], axis=1)

    return price


def get_energy_price_time(energy_price: dict[str, str | int]) -> tuple[int, int, int, int, int, int, int, int]:
    """return the start and end times for low and high energy prices"""

    start_low_hour = int(energy_price["start_low"] / 60)
    end_low_hour = int(energy_price["end_low"] / 60)
    start_high_hour = int(energy_price["start_high"] / 60)
    end_high_hour = int(energy_price["end_high"] / 60)

    start_low_min = energy_price["start_low"] - start_low_hour * 60
    end_low_min = energy_price["end_low"] - end_low_hour * 60
    start_high_min = energy_price["start_high"] - start_high_hour * 60
    end_high_min = energy_price["end_high"] - end_high_hour * 60

    return (start_low_hour, end_low_hour, start_high_hour, end_high_hour,
            start_low_min, end_low_min, start_high_min, end_high_min)


def publish_heating_pumps(heating_pumps: list[list[str]]) -> None:
    """activate the heating pumps specified in the argument"""

    on_result = []
    off_result = []
    for heating_pump in heating_pumps:
        if heating_pump[1] == "":
            continue
        else:
            topic = get_cloud_to_device_mqtt_topic(heating_pump[0])
            msg_on = [{"n": heating_pump[1], "v": 1}]
            msg_off = [{"n": heating_pump[1], "v": 0}]
            on_result.append({"topic": topic,
                              "values": [msg_on]})
            off_result.append({"topic": topic,
                               "values": [msg_off]})

    logging.debug(f'publishing {on_result} for {heating_pumps}')

    publish_to_http(on_result)
    time.sleep(60)
    publish_to_http(off_result)


def assign_soc_or_tpow(names: list[str], identifiers: list[str], prediction: list[np.array],
                       store_dict: dict[str, np.array], include_last: bool = False) -> None:
    """assign predictions for the passed identifiers to the state"""

    i = 0
    for name, p in zip(names, identifiers):
        if p == "" or p.isdigit():
            continue
        if include_last:
            store_dict[name] = prediction[i]
        else:
            store_dict[name] = prediction[i][:-1]
        i += 1
