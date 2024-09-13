from __future__ import annotations

import pandas as pd

from ai.interface.data_holder import DataHolder
from ai.utils.ems_component_utils import PvComponent, GeneratorComponent, GridComponent, BatteryComponent, \
    HouseComponent, \
    ChargeStationComponent, ElectricHeatingComponent, HeatingPumpComponent, BigConsumerComponent, EmsRule, EmsComponent
from ai.utils.http_utils import fetch_last_value


class EmsDataHolder(DataHolder):
    def __init__(
            self, device_id: str, collection_id: str, project_id: str, start: int, heart_beat: str, error: str,
            ready: str, name: str, created_at: str, favorite: bool, error_rule: str, warning_rule: str, site_id: int,
            username: str, password: str, calculated_battery_power: str, size_main_fuse: dict[str, str],
            operation_mode: str, algorithm_model_ems: int, max_depth: str, reserve_battery: str, adaptive_self_consumption: str, activate_heating_pump: str,
            min_charge_battery: str, reserve_charge: str, update_time: str, message: str, state_main_fuse: str,
            activate_main_fuse: str, state_enable_ems: str, enable_ems: str, energy_price: dict[str, float | str],
            scaling: dict[str, float], mode: int, pv: PvComponent, generator: GeneratorComponent, grid: GridComponent,
            battery: BatteryComponent, house: HouseComponent, charge_station: ChargeStationComponent,
            electric_heating: ElectricHeatingComponent, heating_pump: HeatingPumpComponent,
            big_consumer: BigConsumerComponent, allow_charging_button: str, allow_charging_state: str, rules: EmsRule,
            enable_controlling: str, type_name: str = "EMS") -> None:
        """creates the ems data holder class, which contains static information which is needed to train and
        deploy the model

        :param device_id: unique identifier for the dataholder and the corresponding model
        :param project_id: unique identifier for the project in which the dataholder and the model were created
        :param type_name: the model type of the corresponding model
        :param collection_id: unique identifier for collection in which
            the dataholder and the model were created
        :param start: indicates the starting date for the model training
        :param site_id: unique identifier for the connected weather site
        :param ready: output variable, to which the model writes its current state, 0 means its not yet trained,
            1 means it has been trained and is ready
        :param error: output variable to which the model writes in case of an error or a warning,
            0 means no error or warnings, 1 means there is a warning, 2 means there is a error
        :param heart_beat: output variable for the model for the periodic heartbeat
        :param username: mqtt username
        :param password: mqtt password
        :param favorite: indicates whether the model has been set as favorite or not
        :param name: name of the model
        :param created_at: timestamp of when the model was created
        :param error_rule: error rule to send alerts when a error happens
        :param warning_rule: warning rule to send alerts when a error happens
        :param calculated_battery_power: output variable to which the model writes the newly
            calculated battery power
        :param size_main_fuse: Indicates the size of the main fuse of the charging stations in kW
        :param operation_mode: holds information regarding which optimization will be used
        :param algorithm_model_ems: holds information regarding which model will be used
        :param max_depth: If islanding is active, the maximum discharge depth of
            the batteries can be set here until the inverter switches off.
        :param reserve_battery: Reserve SOC in battery for emergency power operation
        :param activate_heating_pump: output variable to which the model writes whether the heating pump
            can be powered by the solar energy or not
        :param min_charge_battery: f emergency power is active battery inverter which builds up the
            stand-alone grid first charge up to this % value, only than allocate power according to priorities
        :param update_time: Update Time when EMS calculates the new emergency surplus or energy consumption
            after that it starts to control the consumers. The Unit is seconds.
        :param reserve_charge: Reserve in battery charged from grid when grid measured < grid max size and
            below this value (only active in peak load capping and load management mode).

        :param message: Message from the EMS Function. 0 = Disabled; 1 = Enabled;
            2 = All priorities at the minimum; 3 = All priorities at the maximum;
            4 = Missing Power Values On Device Setup; 5 = Too many Functions In This Project
        :param state_main_fuse: state of the main fuse switch
        :param activate_main_fuse: activate the main fuse
        :param state_enable_ems: status of the enable ems switch
        :param enable_ems: activate the EMS
        :param energy_price: stores every information of the price of the energy is stored
        :param scaling: stores every information for chart scaling is stored
        :param mode: Operation Mode EMS
        """

        super().__init__(device_id=device_id, project_id=project_id, collection_id=collection_id,
                         start=start, site_id=site_id, ready=ready, error=error, heart_beat=heart_beat,
                         username=username, password=password, favorite=favorite, name=name, created_at=created_at,
                         error_rule=error_rule, warning_rule=warning_rule, type_name=type_name)
        self.state_enable_ems = state_enable_ems
        self.energy_price = energy_price
        self.enable_ems = enable_ems
        self.calculated_battery_power = calculated_battery_power
        self.activate_heating_pump = activate_heating_pump
        self.size_main_fuse = size_main_fuse
        self.operation_mode = operation_mode
        self.algorithm_model_ems = algorithm_model_ems
        self.max_depth = max_depth
        self.reserve_battery = reserve_battery
        self.adaptive_self_consumption = adaptive_self_consumption
        self.min_charge_battery = min_charge_battery
        self.reserve_charge = reserve_charge
        self.update_time = update_time
        self.message = message
        self.pv = pv
        self.generator = generator
        self.grid = grid
        self.battery = battery
        self.house = house
        self.charge_station = charge_station
        self.electric_heating = electric_heating
        self.heating_pump = heating_pump
        self.big_consumer = big_consumer
        self.scaling = scaling
        self.allow_charging_button = allow_charging_button
        self.allow_charging_state = allow_charging_state
        self.rules = rules
        self.enable_controlling = enable_controlling
        project_id_placeholder = project_id.replace("-", "_")
        self.mode = mode
        self.activate_main_fuse = activate_main_fuse
        self.state_main_fuse = state_main_fuse

        self.outdoor_temperature = "weather." + project_id_placeholder + ".tt"
        self.horizontal_radiation = "weather." + project_id_placeholder + ".gh"
        self.diffuse_radiation = "weather." + project_id_placeholder + ".dr"
        self.inclined_radiation = "weather." + project_id_placeholder + ".gi"
        self.normal_radiation = "weather." + project_id_placeholder + ".nr"

    @classmethod
    def from_dict(cls, d: dict[str, ...]) -> EmsDataHolder:
        """creates an ems data holder from the dictionary"""

        controller_mappings = d["data"]["meta"]["controllerMappings"]

        if "activate_main_fuse" in controller_mappings.keys():
            amf = controller_mappings["activate_main_fuse"]
        else:
            amf = ""

        if "state_main_fuse" in controller_mappings.keys():
            smf = controller_mappings["state_main_fuse"]
        else:
            smf = ""

        if "allow_charging_button" in controller_mappings.keys():
            acb = controller_mappings["allow_charging_button"]
        else:
            acb = ""

        if "allow_charging_state" in controller_mappings.keys():
            acs = controller_mappings["allow_charging_state"]
        else:
            acs = ""

        if "enable_controlling" in controller_mappings.keys():
            ec = controller_mappings["enable_controlling"]
        else:
            ec = ""

        if "rules" in d["data"]["meta"].keys():
            rd = d["data"]["meta"]["rules"]
        else:
            rd = {}

        if "settings" in d["data"]["meta"].keys():
            settings = d["data"]["meta"]["settings"]
        else:
            settings = {"energyPrice": {}, "mode": 2, "algorithmModelEms": 0}

        if "energyPrice" in settings.keys():
            ep = settings["energyPrice"]
        else:
            ep = {}

        if "mode" in settings.keys():
            mode = settings["mode"]
        else:
            mode = 2
            
        if "algorithmModelEms" in settings.keys():
            algorithm_model_ems = settings["algorithmModelEms"]
        else:
            algorithm_model_ems = 0

        return cls(project_id=d["project_id"], device_id=d["id"], collection_id=d["collection_id"],
                   heart_beat=controller_mappings["heartbeat"], ready=controller_mappings["mpcReady"],
                   error=controller_mappings["errorWarning"], name=d["name"], created_at=d["created_at"],
                   favorite=d["favorite"], error_rule=d["data"]["meta"]["errorRule"],
                   warning_rule=d["data"]["meta"]["warningRule"], site_id=d["data"]["meta"]["site_id"],
                   username=d["data"]["meta"]["username"], password=d["data"]["meta"]["password"],
                   start=controller_mappings["startDate"],
                   calculated_battery_power=controller_mappings["calculated_battery_power"],
                   size_main_fuse=controller_mappings["size_main_fuse"],
                   operation_mode=controller_mappings["operation_mode"],
                   max_depth=controller_mappings["max_depth"],
                   reserve_battery=controller_mappings["reserve_battery"],
                   adaptive_self_consumption=controller_mappings.get("adaptive_self_consumption"),
                   min_charge_battery=controller_mappings["min_charge_battery"],
                   reserve_charge=controller_mappings["reserve_charge"],
                   update_time=controller_mappings["update_time"],
                   message=controller_mappings["message"],
                   pv=PvComponent.from_dict(controller_mappings["pv"]),
                   generator=GeneratorComponent.from_dict(
                       controller_mappings["generator"]),
                   grid=GridComponent.from_dict(controller_mappings["grid"]),
                   battery=BatteryComponent.from_dict(
                       controller_mappings["battery"]),
                   house=HouseComponent.from_dict(
                       controller_mappings["house"]),
                   charge_station=ChargeStationComponent.from_dict(
                       controller_mappings["charge_station"]),
                   electric_heating=ElectricHeatingComponent.from_dict(
                       controller_mappings["electric_heating"]),
                   heating_pump=HeatingPumpComponent.from_dict(
                       controller_mappings["heating_pump"]),
                   big_consumer=BigConsumerComponent.from_dict(
                       controller_mappings["big_consumer"]),
                   state_enable_ems=controller_mappings["state_enable_ems"],
                   enable_ems=controller_mappings["enable_ems"],
                   energy_price=ep,
                   activate_heating_pump=controller_mappings["activate_heating_pump"],
                   scaling=d["data"]["meta"]["scaling"], allow_charging_button=acb, allow_charging_state=acs,
                   rules=EmsRule.from_dict(rd), enable_controlling=ec, mode=mode, algorithm_model_ems=algorithm_model_ems, activate_main_fuse=amf,
                   state_main_fuse=smf)

    def to_dict(self) -> dict[str, ...]:
        """creates a dictionary from the instance"""

        return {"collection_id": self.collection_id,
                "project_id": self.project_id,
                "created_at": self.created_at,
                "name": self.name,
                "id": self.device_id,
                "favorite": self.favorite,
                "data": {
                    "type": self.type_name,
                    "meta":
                        {
                            "settings": {
                                "mode": self.mode,
                                "energyPrice": self.energy_price,
                                "algorithmModelEms": self.algorithm_model_ems
                            },
                            "scaling": self.scaling,
                            "rules": self.rules.to_dict(),
                            "controllerMappings": {
                                "state_main_fuse": self.state_main_fuse,
                                "activate_main_fuse": self.activate_main_fuse,
                                "state_enable_ems": self.state_enable_ems,
                                "enable_controlling": self.enable_controlling,
                                "enable_ems": self.enable_ems,
                                "size_main_fuse": self.size_main_fuse,
                                "operation_mode": self.operation_mode,
                                "max_depth": self.max_depth,
                                "reserve_battery": self.reserve_battery,
                                "adaptive_self_consumption": self.adaptive_self_consumption,
                                "min_charge_battery": self.min_charge_battery,
                                "reserve_charge": self.reserve_charge,
                                "update_time": self.update_time,
                                "calculated_battery_power": self.calculated_battery_power,
                                "activate_heating_pump": self.activate_heating_pump,
                                "message": self.message,
                                "pv": self.pv.to_dict(),
                                "generator": self.generator.to_dict(),
                                "grid": self.grid.to_dict(),
                                "battery": self.battery.to_dict(),
                                "house": self.house.to_dict(),
                                "charge_station": self.charge_station.to_dict(),
                                "electric_heating": self.electric_heating.to_dict(),
                                "heating_pump": self.heating_pump.to_dict(),
                                "big_consumer": self.big_consumer.to_dict(),
                                "heartbeat": self.heart_beat,
                                "mpcReady": self.ready,
                                "errorWarning": self.error,
                                "startDate": self.start,
                                "siteID": self.site_id,
                                "allow_charging_state": self.allow_charging_state,
                                "allow_charging_button": self.allow_charging_button
                            },
                            "errorRule": self.error_rule,
                            "warningRule": self.warning_rule,
                        },
                }}

    def get_data(self, start: int, end: int, prediction: bool = False, agg: str = "avg") -> pd.DataFrame:
        """data interface for the time series data

         :param start: start date of the requested data
         :param end: end date of the requested data
         :param agg: aggregation type of the requested data
         :param prediction: if the data is received during training, weather forecast is not needed,
             if it is fetched during deployment the weather forecast needs to be added to the dataframe

         :return: dataframe containing power values and weather data
         """
        df = self._get_data(["outdoor_temperature", "horizontal_radiation",
                             "diffuse_radiation", "inclined_radiation", "normal_radiation"], start, end)

        df = df.set_index("ts")

        keys = ["pv", "generator", "grid", "battery", "house", "charge_station", "electric_heating", "heating_pump",
                "big_consumer"]

        for k, v in self.__dict__.items():
            if k in keys:
                v: EmsComponent
                if len(v.power) > 0:
                    df2 = v.get_data(start, end, self.project_id, agg=agg)
                    if not df2.empty:
                        df = df.merge(df2, left_index=True, right_index=True)

        if prediction:
            forecast = self.get_weather_forecast()
            forecast = forecast[forecast.index > df.index[-1]]
            df = pd.concat([df, forecast])

        return df

    def get_battery_min_reserve(self) -> float:
        """get the minimal reserve of the battery"""

        if self.min_charge_battery == "":
            return 0
        return fetch_last_value(self.reserve_battery, self.project_id)
