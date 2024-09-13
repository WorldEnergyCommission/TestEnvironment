/** System name keys used in mappings */
export enum SystemTypes {
  pvSystem = "pvSystem",
  generator = "generator",
  heatProducer = "heatProducer",
  grid = "grid",
  battery = "battery",
  houseConsumption = "houseConsumption",
  evChargingStation = "evChargingStation",
  electricHeating = "electricHeating",
  heatingPump = "heatingPump",
  otherBigConsumer = "otherBigConsumer",
  heatMeter = "heatMeter",
}

export enum EMSSystemTypes {
  pv = "pv",
  generator = "generator",
  battery = "battery",
  grid = "grid",
  house = "house",
  charge_station = "charge_station",
  electric_heating = "electric_heating",
  heating_pump = "heating_pump",
  big_consumer = "big_consumer",
}
export type EMSSystemType = keyof typeof EMSSystemTypes;
export const EMSSystemKeys = Object.keys(EMSSystemTypes) as EMSSystemType[];
export type SystemTypeString = keyof typeof SystemTypes;
export const DeviceTypeKeys = Object.keys(SystemTypes) as SystemTypeString[];

export const producerSystems: SystemTypeString[] = ["pvSystem", "generator", "heatProducer"];
export const consumerSystems: SystemTypeString[] = [
  "houseConsumption",
  "evChargingStation",
  "electricHeating",
  "heatingPump",
  "otherBigConsumer",
  "heatMeter",
];

/** Maps the system name from the mapping to the name of the vue component */
export const systemComponentMappings: Record<SystemTypeString, string> = {
  pvSystem: "PVSystem",
  generator: "Generator",
  heatProducer: "HeatProducer",
  grid: "GridSystem",
  battery: "Battery",
  houseConsumption: "HouseSystem",
  evChargingStation: "ChargeStationSystem",
  electricHeating: "ElectricHeating",
  heatingPump: "PumpSystem",
  otherBigConsumer: "BigConsumerSystem",
  heatMeter: "HeatMeter",
};

/**
 * Since mlModel uses other system keys, that can already be used in db, this mapping
 * links energy view system types to mlModel system types.
 */
export const systemMLMappings: Record<SystemTypeString, string> = {
  pvSystem: "pv",
  generator: "generator",
  heatProducer: "heat_producer",
  grid: "grid",
  battery: "battery",
  houseConsumption: "house",
  evChargingStation: "charge_station",
  electricHeating: "electric_heating",
  heatingPump: "heating_pump",
  otherBigConsumer: "big_consumer",
  heatMeter: "heat_meter",
};

/**
 * Since mlModel uses other system keys, that can already be used in db, this mapping
 * links energy view system types to mlModel system types.
 */
export const mlSystemMappings: Record<string, string> = {
  pv: "pvSystem",
  generator: "generator",
  heat_producer: "heatProducer",
  grid: "grid",
  battery: "battery",
  house: "houseConsumption",
  charge_station: "evChargingStation",
  electric_heating: "electricHeating",
  heating_pump: "heatingPump",
  big_consumer: "otherBigConsumer",
  heat_meter: "heatMeter",
};

export const systemIntervals = new Map<string, number>(
  Object.entries({
    "1s": 1,
    "15s": 15,
    "1m": 60,
    "15m": 15 * 60,
    "1h": 60 * 60,
  }),
);

export const systemIcons: Record<SystemTypeString, string> = {
  pvSystem: "photovoltaic",
  generator: "generator",
  heatProducer: "temperature_return",
  grid: "main-connection",
  battery: "devices",
  houseConsumption: "house-consumption",
  evChargingStation: "electric-charging-station",
  electricHeating: "electric-charging-boiler",
  heatingPump: "heating-capacity",
  otherBigConsumer: "socket-switch",
  heatMeter: "temperature_forward",
};

export const emsIcons: Record<EMSSystemType | SystemTypeString, string | null> = {
  pv: "photovoltaic",
  generator: "generator",
  house: "house-consumption",
  grid: "main-connection",
  battery: null,
  charge_station: "electric-charging-station",
  electric_heating: "electric-charging-boiler",
  heating_pump: "heating-capacity",
  big_consumer: "socket-switch",
  heatProducer: "temperature_return",
  houseConsumption: "house-consumption",
  evChargingStation: "electric-charging-station",
  electricHeating: "electric-charging-boiler",
  heatingPump: "heating-capacity",
  otherBigConsumer: "socket-switch",
  heatMeter: "temperature_forward",
  pvSystem: "photovoltaic",
};

// Converts device type enum to iterable string array
export const getDeviceTypeKeys = (): SystemTypeString[] => {
  return Object.keys(SystemTypes) as SystemTypeString[];
};

export const isDeviceTypeString = (value: string): value is SystemTypeString => {
  return (getDeviceTypeKeys() as string[]).includes(value);
};

export interface SystemsGroup {
  components?: Record<string, SystemData>;
  count: number;
}

export interface SystemData {
  /** System title */
  title: string;
  /** Mapped variable name */
  power: string;
  systemType: SystemTypeString;
  error: string;
  /** Battery related attribute */
  soc?: string;
  /** Used to override fetching of mqtt value with aggregations */
  powerValue?: number;
  /** Used for time derivative systems like HeatMeter */
  interval?: string;
}

export const defaultArrowMovementFromPointToCenter: Record<
  SystemTypeString | EMSSystemType,
  boolean
> = {
  pvSystem: true,
  generator: true,
  heatProducer: false,
  grid: true,
  battery: true,
  houseConsumption: false,
  evChargingStation: false,
  electricHeating: false,
  heatingPump: false,
  otherBigConsumer: false,
  heatMeter: false,
  pv: true,
  house: false,
  charge_station: false,
  electric_heating: false,
  heating_pump: false,
  big_consumer: false,
};

const greenHex = "#29810e";
const yellowHex = "#f3db04";
const redHex = "#fc0328";
const greyHex = "#525252";

export const defaultColor: Record<SystemTypeString | EMSSystemType, string> = {
  pvSystem: greenHex,
  pv: greenHex,
  generator: greenHex,
  heatProducer: greenHex,
  grid: greenHex,
  battery: greenHex,
  houseConsumption: greenHex,
  house: greenHex,
  evChargingStation: greenHex,
  charge_station: greenHex,
  electricHeating: greenHex,
  electric_heating: greenHex,
  heatingPump: greenHex,
  heating_pump: greenHex,
  otherBigConsumer: greenHex,
  big_consumer: greenHex,
  heatMeter: greenHex,
};

export const alternativeColor: Record<SystemTypeString | EMSSystemType, string> = {
  pvSystem: greenHex,
  pv: greenHex,
  generator: yellowHex,
  heatProducer: yellowHex,
  grid: redHex,
  battery: redHex,
  houseConsumption: yellowHex,
  house: yellowHex,
  evChargingStation: yellowHex,
  charge_station: yellowHex,
  electricHeating: yellowHex,
  electric_heating: yellowHex,
  heatingPump: yellowHex,
  heating_pump: yellowHex,
  otherBigConsumer: yellowHex,
  big_consumer: yellowHex,
  heatMeter: yellowHex,
};
