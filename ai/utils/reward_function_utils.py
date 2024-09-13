from typing import Callable

from optuna.study import StudyDirection


def get_squared_error_reward_config() -> tuple[Callable[[float, float], float], StudyDirection]:
    """this function can be used to use the squared error reward"""

    def squared_error(actual: float, expected: float) -> float:
        return (actual - expected) ** 2

    return squared_error, StudyDirection.MINIMIZE


def get_absolute_error_reward_config() -> tuple[Callable[[float, float], float], StudyDirection]:
    """this function can be used to use the absolute error reward"""

    def absolute_error(actual: float, expected: float) -> float:
        return abs(actual - expected)

    return absolute_error, StudyDirection.MINIMIZE
