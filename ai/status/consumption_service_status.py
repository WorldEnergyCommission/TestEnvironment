import datetime

import pytz

from ai.interface.status import Status
from ai.utils.time_utils import get_timestamps


class ConsumptionServiceStatus(Status):
    def __init__(self) -> None:
        """creates a new status instance"""

        # count is a debug variable
        self.count = 0

        # predictions of the model
        self.predicted_power = [0] * 24 * 4
        self.predicted_energy = [0] * 24 * 4
        self.predicted_power_history = 0
        self.current_energy = 0

        super().__init__()

    def to_dict(self) -> dict[str, object]:
        """converts the status object to a dictionary"""

        start = datetime.datetime.now().replace(
            second=0, microsecond=0).astimezone(pytz.timezone("CET"))
        start -= datetime.timedelta(minutes=start.minute % 15 - 15)
        ts = get_timestamps(start, 96)

        pv_response = []
        energy_response = []

        for t, p, e in zip(ts.tolist(), self.predicted_power, self.predicted_energy):
            pv_response.append([t, round(p, 2)])
            energy_response.append([t, round(e, 2)])

        return {"charts": {
            "predictedPower": {"pv": pv_response},
            "predictedEnergy": {"pv": energy_response}
        },
            "status": self.status,
            "ready": self.ready == 2,
            "debugReady": self.ready,
            "error": self.error
        }
