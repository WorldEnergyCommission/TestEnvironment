import devicesTypes from "./devicesTypes";
import { IDevicesTypes } from "../types";
import { envDevices } from "@/utils/env";

// device types filtered by VUE_APP_DEVICES of config.js
const devicesTypesFiltered: Partial<IDevicesTypes> = {};
const filterList: string[] = envDevices;

// eslint-disable-next-line no-restricted-syntax
for (const [key, value] of Object.entries(devicesTypes)) {
  if (filterList.indexOf(key) !== -1) {
    devicesTypesFiltered[key as keyof typeof devicesTypes] = value;
  }
}

export default devicesTypesFiltered;
