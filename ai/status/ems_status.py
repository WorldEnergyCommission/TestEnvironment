import datetime

import pytz

from ai.data_holder.ems_data_holder import EmsDataHolder
from ai.interface.status import Status
from ai.utils.time_utils import get_timestamps


class EmsStatus(Status):
    def __init__(self) -> None:
        """creates a new status instance"""

        # count is a debug variable
        self.count = 0

        # predictions of the model
        self.predicted_power = {}
        self.predicted_energy = {}
        self.predicted_soc = {}
        self.predicted_target_power = {}
        self.predicted_power_history = {}
        self.enable_controlling = 1
        self.absolute_error = 1.086 * 1.05
        self.winter_mode = 0

        # next optimization day
        self.next_optimization_day = None

        super().__init__()

    def to_dict(self) -> dict[str, object]:
        """converts the status object to a dictionary"""

        start = datetime.datetime.now().replace(
            second=0, microsecond=0).astimezone(pytz.timezone("CET"))
        start -= datetime.timedelta(minutes=start.minute % 15 - 15)
        ts = get_timestamps(start, 96)

        power_response = {}
        energy_response = {}
        soc_response = {}
        tpow_response = {}

        for key in self.predicted_power.keys():
            if key == "bat_power":
                continue
            power_response[key] = []
            energy_response[key] = []
            for t, p, e in zip(ts.tolist(), self.predicted_power[key], self.predicted_energy[key]):
                power_response[key].append([t, round(p, 1)])
                energy_response[key].append([t, round(e, 1)])

            if key in self.predicted_soc:
                soc_response[key] = []
                for t, s in zip(ts.tolist(), self.predicted_soc[key]):
                    soc_response[key].append([t, round(s, 1)])

            if key in self.predicted_target_power:
                tpow_response[key] = []
                for t, s in zip(ts.tolist(), self.predicted_target_power[key]):
                    tpow_response[key].append([t, round(s, 1)])

        return {"charts": {
            "predictedPower": power_response,
            "predictedEnergy": energy_response,
            "predictedSOC": soc_response,
            "predictedTargetPower": tpow_response
        },
            "status": self.status,
            "winter_mode": self.winter_mode,
            "ready": self.ready == 2,
            "debugReady": self.ready,
            "error": self.error
        }

    def fill_initial_values(self, dh: EmsDataHolder) -> None:
        """fill initial values of the status"""

        for generic_names in (dh.pv.name, dh.grid.name, dh.battery.name, dh.heating_pump.name,
                              dh.electric_heating.name, dh.charge_station.name, dh.big_consumer.name, dh.house.name):
            for n in generic_names:
                self.predicted_power[n] = [0] * 24 * 4
                self.predicted_energy[n] = [0] * 24 * 4
                self.predicted_power_history[n] = 0
        for target_power_names in (dh.battery.name, dh.heating_pump.name, dh.electric_heating.name,
                                   dh.charge_station.name, dh.big_consumer.name):
            for n in target_power_names:
                self.predicted_target_power[n] = [0] * 24 * 4
        for battery_names in (dh.battery.name,):
            for n in battery_names:
                self.predicted_soc[n] = [0] * 24 * 4
