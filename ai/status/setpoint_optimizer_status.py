import datetime

import pytz

from ai.data_holder.setpoint_optimizer_data_holder import SetpointOptimizerDataHolder
from ai.interface.status import Status
from ai.utils.time_utils import get_timestamps


class SetpointOptimizerStatus(Status):
    def __init__(self) -> None:
        """creates a new status instance"""

        super().__init__()
        self.predicted_setpoint_temperature = {}
        self.write_to_mqtt = {}
        self.next_update_date = None
        self.curve_params = {}
        self.ts_start = 0
        self.ts_end = 0

    def to_dict(self) -> dict[str, object]:
        """converts the status object to a dictionary"""

        start = datetime.datetime.now().replace(
            second=0, microsecond=0).astimezone(pytz.timezone("CET"))
        start -= datetime.timedelta(minutes=start.minute % 15 - 15)
        ts = get_timestamps(start, 96)

        setpoint_response = {}

        for key in self.predicted_setpoint_temperature.keys():
            setpoint_response[key] = []
            for t, s in zip(ts.tolist(), self.predicted_setpoint_temperature[key]):
                setpoint_response[key].append([t, round(s, 1)])

        return {
            "ready": self.ready == 2,
            "debug_ready": self.ready,
            "status": self.status,
            "error": self.error,
            "charts": {
                "predictedSetpoint": setpoint_response
            },
            "next_update_date": self.next_update_date,
            "curve_params": self.curve_params,
            "ts_start": self.ts_start,
            "ts_end": self.ts_end
        }

    def fill_initial_values(self, dh: SetpointOptimizerDataHolder) -> None:
        """fill initial values of the status"""

        for system in (dh.heating_air_systems, dh.heating_water_systems, dh.cooling_water_systems,
                       dh.cooling_air_systems, dh.hybrid_water_systems, dh.hybrid_air_systems):
            for s in system:
                self.predicted_setpoint_temperature[s.identifier] = [0] * 24 * 4
