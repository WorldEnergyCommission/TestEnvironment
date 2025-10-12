import { Map } from "immutable";

import devicesTypes from "./settings/devicesTypes";

export interface IDevicesState {
  devices: Map<string, IDevice>;
  devicesTypes: IDevicesTypes;
  devicesTypesFiltered: Partial<IDevicesTypes>;
  devicesFilter: string;
}

export type IDevicesTypes = {
  [devicePropName in keyof typeof devicesTypes]: IDeviceType;
};

export interface IDeviceType {
  mappings: {
    [mappingKey: string]: IDeviceMapping;
  };
  manageSchema: string;
  isSettingsView: boolean;
  devicesSchemas: any;
}

export interface IDeviceMapping {
  optional: boolean;
  minMaxBorders?: {
    min: number;
    max: number;
  };
}

export interface IDevice {
  id: string;
  name: string;
  data: any;
  favorite: boolean;
  collection_id: string;
  project_id?: string;
  created_at: Date;
}

export interface IRecord {
  // n = Name
  n: string;
  // u = Unit
  u?: string;
  // v = Value number
  v?: number;
  // vs = Value string
  vs?: string;
}

export interface IVehicleRecord {
  id?: string;
  plate: string; // License plate
  status: string; // aktiv/inactive
  company: string; // Company
  brand: string; // Brand
  model: string; // Model Type
  driver: string; // Current driver name
  priority: number; // Priority level (1-3)
  maxPower: number; // Maximum power draw (kW)
  chipNummer: number; // Chip number (RFID) - required integer
}

export interface ILoadManagementData {
  records: IVehicleRecord[];
}
