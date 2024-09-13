import statistics

import sinergym


def get_value_from_obs_dict(obs_dict: dict[str, ...], name: str) -> float | int:
    """get value from observation dict"""
    return obs_dict[name]


def get_average_room_temperature(obs_dict: dict[str, ...], temperature_variables: list[str]) -> float:
    """get the current average room temperature"""
    temperature_values = [get_value_from_obs_dict(obs_dict, x) for x in temperature_variables]
    return statistics.mean(temperature_values)


class CustomReward(sinergym.BaseReward):
    """this class gives the controller a reward based on the temperature deviation to the setpoint"""

    def __init__(
            self,
            temperature_variables: list[str],
            setpoint: float,
    ):
        """sets internal variable fields"""
        super(CustomReward, self).__init__()
        self._temperature_variables = temperature_variables
        self._setpoint = setpoint

    # noinspection PyMethodOverriding
    def __call__(
            self,
            obs_dict: dict[str, ...]
    ) -> tuple[float, dict[str, ...]]:
        """compute the current reward"""
        average_temperature_value = get_average_room_temperature(obs_dict, self._temperature_variables)
        temperature_reward = self.get_temperature_reward(average_temperature_value)
        reward_info = {
            'temperature': average_temperature_value,
            'setpoint': self._setpoint,
        }
        return temperature_reward, reward_info

    def get_temperature_reward(self, temperature_value: float) -> float:
        """use the inversion of the quadratic absolute error of the temperature as reward"""
        return -1 * abs(self._setpoint - temperature_value) ** 2
