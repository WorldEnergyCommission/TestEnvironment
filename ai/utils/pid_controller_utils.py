import simple_pid

from ai.utils.control_type_utils import ControlType
from ai.utils.setpoint_optimizer_interface_utils import ParameterConfig, ParameterValue, SetpointOptimizerInterface, \
    get_value_by_parameter_name

"""heating water parameter configs"""
HEATING_WATER_PARAMETER_CONFIGS = (
    ParameterConfig(name='Kp', initial_value=0.5, limits=(0.3, 0.6), step=0.1),
    ParameterConfig(name='Ki', initial_value=0.0008, limits=(0.0004, 0.0012), step=0.0004),
    ParameterConfig(name='Kd', initial_value=25.0, limits=(0.0, 25.0), step=12.5)
), (0.0, 1.0)


class PidController(SetpointOptimizerInterface):
    """pid controller to control the mean indoor temperature"""

    def __init__(self, control_type: ControlType):
        self.control_type = control_type
        match self.control_type:
            case ControlType.HEATING_WATER:
                parameter_configs, output_limits = HEATING_WATER_PARAMETER_CONFIGS
            case _:
                raise ValueError
        super().__init__(parameter_configs, output_limits)
        self.pid = simple_pid.PID(Kp=0,
                                  Ki=0,
                                  Kd=0,
                                  setpoint=0,
                                  sample_time=None,
                                  output_limits=self.output_limits,
                                  auto_mode=True,
                                  proportional_on_measurement=False,
                                  differential_on_measurement=False,
                                  error_map=None,
                                  time_fn=None,
                                  starting_output=min(self.output_limits))

    def set_parameter_values(self, parameter_values: tuple[ParameterValue, ...]) -> None:
        """set controller parameters"""

        self.pid.tunings = (
            get_value_by_parameter_name(parameter_values, 'Kp'),
            get_value_by_parameter_name(parameter_values, 'Ki'),
            get_value_by_parameter_name(parameter_values, 'Kd')
        )

    def set_setpoint_temperature(self, setpoint_temperature: float) -> None:
        """set the setpoint in the controller"""

        self.pid.setpoint = setpoint_temperature

    def get_model_output(self,
                         mean_room_temperature: float,
                         setpoint_temperature: float,
                         parameter_values: tuple[ParameterValue, ...],
                         dt_seconds: float | None,
                         ) -> float:
        """get the output of the controller"""

        self.set_setpoint_temperature(setpoint_temperature)
        self.set_parameter_values(parameter_values)
        return self.pid(mean_room_temperature, dt_seconds)

    def reset_model(self) -> None:
        """reset the controller internals"""

        self.pid.reset()
