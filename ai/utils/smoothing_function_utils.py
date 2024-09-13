from enum import Enum
from statistics import mean, median
from typing import Callable

import scipy.ndimage


class WindowOffset(Enum):
    """enum to specify the window offset"""

    PAST = 0
    PRESENT = 1
    FUTURE = 2


class ReturnIndex(Enum):
    """enum to specify the return index"""

    FIRST = 0
    MIDDLE = 1
    LAST = 2


class SmoothingFunctionName(Enum):
    """enum to access the smoothing functions"""

    MEAN = 0
    MEDIAN = 1
    GAUSS = 2


def get_smoothing_function_based_on_name(
        name: SmoothingFunctionName, **kwargs) -> tuple[Callable[[list[float]], float], int, WindowOffset]:
    """get the correct function based on the name"""

    match name:
        case SmoothingFunctionName.MEAN:
            return get_mean_smoothing_function(**kwargs)
        case SmoothingFunctionName.MEDIAN:
            return get_median_smoothing_function(**kwargs)
        case SmoothingFunctionName.GAUSS:
            return get_gauss_smoothing_function(**kwargs)
        case _:
            raise ValueError


def get_default_window_size() -> int:
    """get the default window size"""

    return 31


def check_window_size(size: int):
    """check the passed windows size"""

    if size % 2 == 0:
        raise RuntimeError


def get_value_of_return_index(values: list[float], return_index: ReturnIndex):
    """get the return value that was passed in the index"""

    if len(values) == 0:
        raise RuntimeError
    match return_index:
        case ReturnIndex.FIRST:
            return values[0]
        case ReturnIndex.MIDDLE:
            if len(values) % 2 == 0:
                raise RuntimeError
            return values[len(values) // 2]
        case ReturnIndex.LAST:
            return values[-1]


def get_mean_smoothing_function(
        window_size_in_minutes: int = get_default_window_size(),
        window_offset: WindowOffset = WindowOffset.PRESENT,
        **kwargs) -> tuple[Callable[[list[float]], float], int, WindowOffset]:
    """get the mean smoothened return value"""

    def mean_smoothing_function(values: list[float]) -> float:
        return mean(values)

    check_window_size(window_size_in_minutes)

    return mean_smoothing_function, window_size_in_minutes, window_offset


def get_median_smoothing_function(
        window_size_in_minutes: int = get_default_window_size(),
        window_offset: WindowOffset = WindowOffset.PRESENT,
        **kwargs) -> tuple[Callable[[list[float]], float], int, WindowOffset]:
    """get the median smoothened return value"""

    def median_smoothing_function(values: list[float]) -> float:
        return median(values)

    check_window_size(window_size_in_minutes)

    return median_smoothing_function, window_size_in_minutes, window_offset


def get_gauss_smoothing_function(
        window_size_in_minutes: int = get_default_window_size(),
        window_offset: WindowOffset = WindowOffset.PRESENT,
        **kwargs) -> tuple[Callable[[list[float]], float], int, WindowOffset]:
    """get the gaussian filtered smoothened return value"""

    def gauss_filter_smoothing_function(values: list[float]) -> float:
        filtered_values = scipy.ndimage.gaussian_filter(
            values, sigma=kwargs.get('sigma', 1), mode=kwargs.get('mode', 'nearest'))
        return get_value_of_return_index(filtered_values, kwargs.get('return_index', ReturnIndex.MIDDLE))

    check_window_size(window_size_in_minutes)

    return gauss_filter_smoothing_function, window_size_in_minutes, window_offset
