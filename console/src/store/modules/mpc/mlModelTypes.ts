import moment from "moment";
import "moment-timezone";
import { Dispatch, useStore } from "vuex";

import { IDevice } from "../devices/types";
import { IRule, IScheduleItem } from "../rules/types";
import { RootState } from "@/store/types";
import colors from "@/ui/components/devices/mpc/colors";
import { weekdayToIndex } from "@/ui/components/forms/Rules/ManageRuleUtils";
import { OperatingSchedule } from "@/ui/components/lists/SettingsList/OperatingHours.vue";
import { envLimits } from "@/utils/env";

/**
 * A collection of device schemas with these options:
 * - **mappingsByColumns** - mappings grouped by columns, which will be drawn in the manage modal form
 * - **controllerMappings** - collection of mappings used in device, are also the form fields in the manage modal form
 * - **settingsMappings** - list of mappings which validates to red frame around the settings list item flashes
 * - **manageSchema** - manage modal form used to create, update device
 * - **isSettingsView** - status whether the device has a settings window
 * - **dynamicMappingsMinMax** - min, max borders to validate value of specific named mappings
 * for settings menu item flashing border
 *
 * Used in EMS and Setpoint Optimizer
 * - **groups** - collection of system groups
 * - **systems** - collection of systems with options settings for them
 * - **additionalFields** - additional fields for manage modal form stage 3
 */
const mlModelTypes = {
  HeatingCircuitOptimization: {
    mappingsByColumns: {
      inputMappings: [
        "valveReturnType",
        "flowTemperature",
        "returnTemperature",
        "areaTemperature",
        "valvePosition",
      ],
      outputMappings: ["newValvePosition", "newAreaTemperature", "newSetTemperature"],
      middleMappings: ["heartbeat", "errorWarning", "mpcReady"],
    },
    controllerMappings: {
      valveReturnType: {
        vuetifyComponent: "SelectField",
        items: ["0-1 Digital"],
        optional: false,
        type: "input",
      },
      flowTemperature: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "input",
      },
      newSetTemperature: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "input",
      },
      returnTemperature: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "input",
      },
      areaTemperature: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "input",
      },
      valvePosition: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "input",
      },
      newValvePosition: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "output",
      },
      newAreaTemperature: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "output",
      },
      heartbeat: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "none",
      },
      errorWarning: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "none",
      },
      mpcReady: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "none",
      },
    },
    settingsMappings: null,
    manageSchema: "HCOSchema",
    isSettingsView: true,
  },
  PVProductionService: {
    mappingsByColumns: {
      inputMappings: ["startDate", "power"],
      outputMappings: ["predictedEnergy", "predictedPower"],
      middleMappings: ["heartbeat", "errorWarning", "mpcReady"],
    },
    controllerMappings: {
      startDate: {
        vuetifyComponent: "DatePickerCustom",
        optional: false,
      },
      heartbeat: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "none",
      },
      errorWarning: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "none",
      },
      power: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "input",
      },
      predictedPower: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "input",
      },
      predictedEnergy: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "input",
      },
      mpcReady: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "none",
      },
    },
    settingsMappings: null,
    manageSchema: "ServicesSchema",
    isSettingsView: false,
  },
  ConsumptionService: {
    mappingsByColumns: {
      inputMappings: ["startDate", "power"],
      outputMappings: ["predictedEnergy", "predictedPower"],
      middleMappings: ["heartbeat", "errorWarning", "mpcReady"],
    },
    controllerMappings: {
      startDate: {
        vuetifyComponent: "DatePickerCustom",
        optional: false,
      },
      heartbeat: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "none",
      },
      errorWarning: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "none",
      },
      power: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        type: "input",
      },
      predictedPower: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "input",
      },
      predictedEnergy: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "input",
      },
      mpcReady: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        type: "none",
      },
    },
    settingsMappings: null,
    manageSchema: "ServicesSchema",
    isSettingsView: false,
  },
  EMS: {
    mappingsByColumns: {
      inputMappings: [
        "startDate",
        "state_enable_ems",
        "allow_charging_state",
        "message",
        "state_main_fuse",
      ],
      outputMappings: [
        "heartbeat",
        "errorWarning",
        "mpcReady",
        "operation_mode",
        "max_depth",
        "reserve_battery",
        "adaptive_self_consumption",
        "min_charge_battery",
        "reserve_charge",
        "update_time",
        "enable_ems",
        "calculated_battery_power",
        "activate_heating_pump",
        "allow_charging_button",
        "enable_controlling",
        "activate_main_fuse",
        "size_main_fuse",
      ],
    },
    controllerMappings: {
      startDate: {
        vuetifyComponent: "DatePickerCustom",
        optional: false,
      },
      activate_heating_pump: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      calculated_battery_power: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      state_enable_ems: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      enable_ems: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      heartbeat: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      errorWarning: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      mpcReady: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      size_main_fuse: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
        isDynamic: true,
        maxRange: 30,
        minMaxBorders: { min: 0, max: 500 },
      },
      operation_mode: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      max_depth: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      reserve_battery: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      adaptive_self_consumption: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      min_charge_battery: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
        minMaxBorders: { min: 25, max: 75 },
      },
      reserve_charge: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
        minMaxBorders: { min: 0, max: 100 },
      },
      update_time: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
        minMaxBorders: { min: 1, max: 600 },
      },
      message: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        isSystem: false,
      },
      allow_charging_button: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      allow_charging_state: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      enable_controlling: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      state_main_fuse: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      activate_main_fuse: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
    },
    groups: {
      producer: {
        id: "producer",
        title: "Producer",
        systems: ["generator", "pv"],
      },
      producerConsumer: {
        id: "producerConsumer",
        title: "Producer Consumer",
        systems: ["grid", "battery"],
      },
      consumer: {
        id: "consumer",
        title: "Consumer",
        systems: ["house", "charge_station", "electric_heating", "heating_pump", "big_consumer"],
      },
    },
    systems: {
      pv: {
        id: "pv",
        title: "PV System",
        required: false,
        group: "producer",
        quantity: envLimits.ems.maxPvSystemQuantity,
        mappingsByColumns: {
          input: ["power", "error"],
          output: [],
          titles: ["title"],
        },
        initMappings: {
          power: "",
          error: "",
          title: "",
        },
        mappings: {
          power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          error: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          title: {
            optional: false,
            vuetifyComponent: "TextField",
          },
        },
      },
      generator: {
        id: "generator",
        title: "Generator",
        required: false,
        group: "producer",
        quantity: envLimits.ems.maxGeneratorQuantity,
        mappingsByColumns: {
          input: ["power", "state_reset", "error", "state_generator", "state_enable"],
          output: ["enable_soc", "disable_soc", "switch_enable", "switch_reset"],
          titles: ["title"],
        },
        initMappings: {
          power: "",
          error: "",
          title: "",
          state_reset: "",
          state_generator: "",
          enable_soc: "",
          disable_soc: "",
          switch_enable: "",
          switch_reset: "",
          state_enable: "",
        },
        mappings: {
          power: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          error: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          title: {
            optional: false,
            vuetifyComponent: "TextField",
            items: "measurements",
          },
          state_reset: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_generator: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          enable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          disable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_reset: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
        },
      },
      grid: {
        id: "grid",
        title: "Grid",
        required: true,
        group: "producerConsumer",
        quantity: 1,
        mappingsByColumns: {
          input: ["power", "error"],
          output: ["size", "status_island"],
          titles: ["title"],
        },
        initMappings: {
          power: "",
          error: "",
          title: "",
          size: "",
          status_island: "",
        },
        mappings: {
          power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          error: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          title: {
            optional: false,
            vuetifyComponent: "TextField",
          },
          size: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          status_island: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
        },
      },
      battery: {
        id: "battery",
        title: "Battery",
        required: false,
        group: "producerConsumer",
        quantity: envLimits.ems.maxBatteryQuantity,
        mappingsByColumns: {
          input: [
            "power",
            "error",
            "soc",
            "target_power",
            "state_enable",
            "state_reset",
            "capacity",
            "soc_range_max",
            "soc_range_min",
            "battery_standby_optimization_state",
            "battery_standby_optimization_mode",
            "battery_standby_optimization_time_on",
            "battery_standby_optimization_time_off",
            "battery_standby_optimization_power_on",
            "battery_standby_optimization_power_off",
          ],
          output: [
            "size_capacity",
            "priority",
            "switch_enable",
            "switch_reset",
            "status_bypass",
            "state_soc_range_max",
            "state_soc_range_min",
          ],
          titles: ["title"],
        },
        initMappings: {
          power: "",
          target_power: "",
          state_enable: "",
          state_reset: "",
          error: "",
          title: "",
          soc: "",
          size_capacity: "",
          capacity: "",
          priority: "",
          switch_enable: "",
          switch_reset: "",
          status_bypass: "",
          soc_range_max: "",
          soc_range_min: "",
          state_soc_range_max: "",
          state_soc_range_min: "",
          battery_standby_optimization_state: "",
          battery_standby_optimization_mode: "",
          battery_standby_optimization_time_on: "",
          battery_standby_optimization_time_off: "",
          battery_standby_optimization_power_on: "",
          battery_standby_optimization_power_off: "",
        },
        mappings: {
          power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          target_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_reset: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          error: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          title: {
            optional: false,
            vuetifyComponent: "TextField",
            items: "measurements",
          },
          soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          size_capacity: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          capacity: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          priority: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_reset: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          status_bypass: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          soc_range_max: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          soc_range_min: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_soc_range_max: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_soc_range_min: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          battery_standby_optimization_state: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          battery_standby_optimization_mode: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          battery_standby_optimization_time_on: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          battery_standby_optimization_time_off: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          battery_standby_optimization_power_on: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          battery_standby_optimization_power_off: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
        },
      },
      house: {
        id: "house",
        title: "House Consumption",
        required: false,
        group: "consumer",
        quantity: envLimits.ems.maxHouseConsumptionQuantity,
        mappingsByColumns: {
          input: ["power", "error", "state_enable"],
          output: ["switch_enable"],
          titles: ["title"],
        },
        initMappings: {
          power: "",
          state_enable: "",
          switch_enable: "",
          error: "",
          title: "",
        },
        mappings: {
          power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          error: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          title: {
            optional: false,
            vuetifyComponent: "TextField",
          },
        },
      },
      charge_station: {
        id: "charge_station",
        title: "EV Charging Station",
        required: false,
        group: "consumer",
        quantity: envLimits.ems.maxEvChargingStationQuantity,
        mappingsByColumns: {
          input: [
            "power",
            "error",
            "car_connected",
            "charging_time",
            "state_charging_station",
            "state_emergency",
            "slider_target_power",
            "state_manual",
            "min_power",
            "target_power",
            "state_enable",
          ],
          output: [
            "switch_emergency",
            "priority",
            "enable_soc",
            "disable_soc",
            "max_power",
            "switch_manual",
            "slider_manual",
            "slider_min_power",
            "switch_enable",
          ],
          titles: ["title"],
        },
        initMappings: {
          power: "",
          error: "",
          title: "",
          car_connected: "",
          charging_time: "",
          state_charging_station: "",
          state_emergency: "",
          state_manual: "",
          min_power: "",
          switch_emergency: "",
          priority: "",
          enable_soc: "",
          disable_soc: "",
          max_power: "",
          slider_manual: "",
          slider_target_power: "",
          slider_min_power: "",
          target_power: "",
          state_enable: "",
          switch_enable: "",
          switch_manual: "",
        },
        mappings: {
          power: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          error: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          car_connected: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          charging_time: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_charging_station: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_emergency: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          min_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_emergency: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          priority: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          enable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          disable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          max_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          slider_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          slider_target_power: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          slider_min_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          target_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          title: {
            optional: false,
            vuetifyComponent: "TextField",
          },
        },
      },
      electric_heating: {
        id: "electric_heating",
        title: "Electric Heating Element",
        required: false,
        group: "consumer",
        quantity: envLimits.ems.maxElectricHeatingElementQuantity,
        mappingsByColumns: {
          input: [
            "power",
            "error",
            "temperature",
            "state_electric_heating",
            "state_emergency",
            "state_manual",
            "state_time",
            "state_disable_protection",
            "slider_target_power",
            "target_power",
            "state_enable",
          ],
          output: [
            "switch_emergency",
            "priority",
            "enable_soc",
            "disable_soc",
            "switch_disable_protection",
            "switch_manual",
            "slider_manual",
            "switch_time",
            "hour_on",
            "minute_on",
            "hour_off",
            "minute_off",
            "target_temp_on",
            "target_temp_off",
            "target_temp_max",
            "switch_enable",
            "max_power",
          ],
          titles: ["title"],
        },
        isDynamicFields: true,
        initMappings: {
          power: "",
          error: "",
          title: "",
          temperature: "",
          state_electric_heating: "",
          state_emergency: "",
          state_manual: "",
          state_time: "",
          state_disable_protection: "",
          switch_emergency: "",
          priority: "",
          enable_soc: "",
          disable_soc: "",
          switch_disable_protection: "",
          switch_manual: "",
          slider_target_power: "",
          switch_time: "",
          hour_on: "",
          minute_on: "",
          hour_off: "",
          minute_off: "",
          target_temp_on: "",
          target_temp_off: "",
          target_temp_max: "",
          max_power: {},
          target_power: "",
          state_enable: "",
          switch_enable: "",
          slider_manual: "",
        },
        mappings: {
          power: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          error: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          title: {
            optional: false,
            vuetifyComponent: "TextField",
          },
          temperature: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_electric_heating: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_emergency: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_time: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_disable_protection: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_emergency: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          priority: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          enable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          disable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_disable_protection: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          slider_target_power: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_time: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          hour_on: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          minute_on: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          hour_off: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          minute_off: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          target_temp_on: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          target_temp_off: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          target_temp_max: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          max_power: {
            vuetifyComponent: "DynamicField",
            isDynamic: true,
            optional: true,
            maxRange: 10,
          },
          target_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          slider_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
        },
      },
      heating_pump: {
        id: "heating_pump",
        title: "Heating Pump",
        required: false,
        group: "consumer",
        quantity: envLimits.ems.maxHeatingPumpQuantity,
        mappingsByColumns: {
          input: [
            "power",
            "error",
            "state_reset",
            "state_heating_pump",
            "state_emergency",
            "state_manual",
            "manual_power",
            "state_time",
            "state_time_power",
            "flow_temperature",
            "return_temperature",
            "inlet_temperature",
            "outlet_temperature",
            "boiler_temperature",
            "boiler_water_temperature",
            "target_power",
            "state_enable",
          ],
          output: [
            "switch_emergency",
            "priority",
            "enable_soc",
            "disable_soc",
            "switch_reset",
            "switch_manual",
            "slider_manual",
            "switch_time",
            "slider_power",
            "hour_on",
            "minute_on",
            "hour_off",
            "minute_off",
            "switch_enable",
            "max_power",
          ],
          titles: ["title"],
        },
        isDynamicFields: true,
        initMappings: {
          power: "",
          error: "",
          title: "",
          state_reset: "",
          state_heating_pump: "",
          state_emergency: "",
          state_manual: "",
          manual_power: "",
          state_time: "",
          state_time_power: "",
          flow_temperature: "",
          return_temperature: "",
          inlet_temperature: "",
          outlet_temperature: "",
          boiler_temperature: "",
          boiler_water_temperature: "",
          switch_emergency: "",
          priority: "",
          enable_soc: "",
          disable_soc: "",
          switch_reset: "",
          switch_manual: "",
          slider_power: "",
          switch_time: "",
          hour_on: "",
          minute_on: "",
          hour_off: "",
          minute_off: "",
          max_power: {},
          switch_enable: "",
          slider_manual: "",
          target_power: "",
          state_enable: "",
        },
        mappings: {
          power: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          error: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          title: {
            optional: false,
            vuetifyComponent: "TextField",
          },
          state_reset: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_heating_pump: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_emergency: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          manual_power: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_time: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_time_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          flow_temperature: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          return_temperature: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          inlet_temperature: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          outlet_temperature: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          boiler_temperature: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          boiler_water_temperature: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_emergency: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          priority: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          enable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          disable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_reset: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          slider_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_time: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          hour_on: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          minute_on: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          hour_off: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          minute_off: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          max_power: {
            vuetifyComponent: "DynamicField",
            isDynamic: true,
            optional: true,
            maxRange: 2,
          },
          switch_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          slider_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          target_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
        },
      },
      big_consumer: {
        id: "big_consumer",
        title: "Other Big Consumer",
        required: false,
        group: "consumer",
        quantity: envLimits.ems.maxBigConsumerQuantity,
        mappingsByColumns: {
          input: [
            "power",
            "error",
            "state_consumer",
            "state_emergency",
            "state_manual",
            "state_enable",
            "target_power",
            "slider_target_power",
          ],
          output: [
            "switch_emergency",
            "priority",
            "enable_soc",
            "disable_soc",
            "switch_manual",
            "switch_enable",
            "slider_manual",
            "max_power",
          ],
          titles: ["title"],
        },
        initMappings: {
          power: "",
          error: "",
          title: "",
          state_consumer: "",
          state_emergency: "",
          state_manual: "",
          switch_emergency: "",
          priority: "",
          enable_soc: "",
          disable_soc: "",
          switch_manual: "",
          state_enable: "",
          switch_enable: "",
          target_power: "",
          slider_manual: "",
          slider_target_power: "",
          max_power: "",
        },
        mappings: {
          power: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          error: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          title: {
            optional: false,
            vuetifyComponent: "TextField",
          },
          state_consumer: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_emergency: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_emergency: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          priority: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          enable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          disable_soc: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          state_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          switch_enable: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          target_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          slider_manual: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          slider_target_power: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          max_power: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
        },
      },
    },
    settingsMappings: [
      "size_main_fuse",
      "max_depth",
      "reserve_battery",
      "adaptive_self_consumption",
      "min_charge_battery",
      "reserve_charge",
      "update_time",
    ],
    additionalFields: {
      component: "EMSAdditionalFields",
      objects: {
        scaling: ["pv", "consumption", "batteryPower"],
        energyPrice: [],
      },
    },
    manageSchema: "EMSSchema",
    isSettingsView: true,
  },
  PVMonitoringService: {
    mappingsByColumns: {
      inputMappings: ["startDate", "endDate", "power"],
      outputMappings: ["efficiency"],
      middleMappings: ["heartbeat", "errorWarning", "mpcReady"],
    },
    controllerMappings: {
      startDate: {
        vuetifyComponent: "DatePickerCustom",
        optional: false,
      },
      endDate: {
        vuetifyComponent: "DatePickerCustom",
        optional: false,
      },
      efficiency: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
      heartbeat: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
      errorWarning: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
      power: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      mpcReady: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
    },
    settingsMappings: ["PV.#id#.decay"], // here used specific mapping naming syntax, it consists from 'PV.mpc_device_id.decay'
    dynamicMappingsMinMax: {
      "PV.#id#.decay": { min: 0, max: 100 },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
  },
  SetpointOptimizer: {
    mappingsByColumns: {
      inputMappings: ["startDate"],
      outputMappings: [
        "mpcReady",
        "heartbeat",
        "errorWarning",
        "algorithmModel",
        "algorithmAdditionalProcessors",
      ],
    },
    controllerMappings: {
      heartbeat: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      mpcReady: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      errorWarning: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
        isSystem: false,
      },
      startDate: {
        vuetifyComponent: "DatePickerCustom",
        optional: false,
      },
      algorithmModel: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        isSystem: false,
      },
      algorithmAdditionalProcessors: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        isSystem: false,
      },
    },
    groups: {
      heating: {
        id: "heating",
        title: "Heating",
        systems: ["heating_air_systems", "heating_water_systems"],
      },
      cooling: {
        id: "cooling",
        title: "Cooling",
        systems: ["cooling_air_systems", "cooling_water_systems"],
      },
      hybrid: {
        id: "hybrid",
        title: "Hybrid",
        systems: ["hybrid_water_systems", "hybrid_air_systems"],
      },
    },
    systems: {
      heating_air_systems: {
        id: "heating_air_systems",
        title: "heating air systems",
        required: false,
        group: "heating",
        quantity: envLimits.spo.maxHeatingAirSystemQuantity,
        mappingsByColumns: {
          input: [
            "flow_temperature",
            "return_temperature",
            "status",
            "in_out_flow_temperature",
            "out_in_flow_temperature",
            "room_temperatures",
          ],
          output: ["optimized_flow_temperature"],
          titles: ["name"],
        },
        initMappings: {
          flow_temperature: "",
          return_temperature: "",
          room_temperatures: {},
          status: "",
          optimized_flow_temperature: "",
          name: "",
          max_flow_temperature: 0,
          min_flow_temperature: 0,
          set_point_temperature: 0,
          in_out_flow_temperature: "",
          out_in_flow_temperature: "",
        },
        mappings: {
          flow_temperature: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          return_temperature: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          room_temperatures: {
            vuetifyComponent: "DynamicFieldWithTitle",
            isDynamic: true,
            optional: false,
            maxRange: 20,
            formTemplate: "",
          },
          status: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          optimized_flow_temperature: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          name: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          in_out_flow_temperature: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          out_in_flow_temperature: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
        },
        isDynamicFields: true,
        colors: {
          rotatingBacklightColor: {
            main: colors.red,
            reversed: colors.red,
          },
          animatedLine: {
            main: colors.red,
            reversed: colors.red,
          },
        },
      },
      heating_water_systems: {
        id: "heating_water_systems",
        title: "heating water systems",
        required: false,
        group: "heating",
        quantity: envLimits.spo.maxHeatingWaterSystemQuantity,
        mappingsByColumns: {
          input: ["flow_temperature", "return_temperature", "status", "room_temperatures"],
          output: ["optimized_flow_temperature"],
          titles: ["name"],
        },
        initMappings: {
          flow_temperature: "",
          return_temperature: "",
          room_temperatures: {},
          status: "",
          optimized_flow_temperature: "",
          name: "",
          max_flow_temperature: 0,
          min_flow_temperature: 0,
          set_point_temperature: 0,
        },
        mappings: {
          flow_temperature: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          return_temperature: {
            optional: true,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          room_temperatures: {
            vuetifyComponent: "DynamicFieldWithTitle",
            isDynamic: true,
            optional: false,
            maxRange: 20,
          },
          status: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          optimized_flow_temperature: {
            optional: false,
            vuetifyComponent: "ComboboxField",
            items: "measurements",
          },
          name: {
            optional: false,
            vuetifyComponent: "TextField",
          },
        },
        isDynamicFields: true,
        colors: {
          rotatingBacklightColor: {
            main: colors.red,
            reversed: colors.red,
          },
          animatedLine: {
            main: colors.red,
            reversed: colors.red,
          },
        },
      },
      cooling_air_systems: {
        id: "cooling_air_systems",
        title: "cooling air systems",
        required: false,
        group: "cooling",
        quantity: envLimits.spo.maxCoolingAirSystemQuantity,
        mappingsByColumns: {
          input: [
            "flow_temperature",
            "return_temperature",
            "status",
            "in_out_flow_temperature",
            "out_in_flow_temperature",
            "room_temperatures",
          ],
          output: ["optimized_flow_temperature"],
          titles: ["name"],
        },
        initMappings: {
          flow_temperature: "",
          return_temperature: "",
          room_temperatures: {},
          status: "",
          optimized_flow_temperature: "",
          name: "",
          max_flow_temperature: 0,
          min_flow_temperature: 0,
          set_point_temperature: 0,
          in_out_flow_temperature: "",
          out_in_flow_temperature: "",
        },
        mappings: {
          flow_temperature: {
            optional: false,
          },
          return_temperature: {
            optional: false,
          },
          room_temperatures: {
            vuetifyComponent: "DynamicFieldWithTitle",
            isDynamic: true,
            optional: false,
            maxRange: 20,
          },
          status: {
            optional: false,
          },
          optimized_flow_temperature: {
            optional: false,
          },
          name: {
            optional: false,
          },
          in_out_flow_temperature: {
            optional: true,
          },
          out_in_flow_temperature: {
            optional: true,
          },
        },
        isDynamicFields: true,
        colors: {
          rotatingBacklightColor: {
            main: colors.blue,
            reversed: colors.blue,
          },
          animatedLine: {
            main: colors.blue,
            reversed: colors.blue,
          },
        },
      },
      cooling_water_systems: {
        id: "cooling_water_systems",
        title: "cooling water systems",
        required: false,
        group: "cooling",
        quantity: envLimits.spo.maxCoolingWaterSystemQuantity,
        mappingsByColumns: {
          input: ["flow_temperature", "return_temperature", "status", "room_temperatures"],
          output: ["optimized_flow_temperature"],
          titles: ["name"],
        },
        initMappings: {
          flow_temperature: "",
          return_temperature: "",
          room_temperatures: {},
          status: "",
          optimized_flow_temperature: "",
          name: "",
          max_flow_temperature: 0,
          min_flow_temperature: 0,
          set_point_temperature: 0,
        },
        mappings: {
          flow_temperature: {
            optional: false,
          },
          return_temperature: {
            optional: true,
          },
          room_temperatures: {
            vuetifyComponent: "DynamicFieldWithTitle",
            isDynamic: true,
            optional: false,
            maxRange: 20,
          },
          status: {
            optional: false,
          },
          optimized_flow_temperature: {
            optional: false,
          },
          name: {
            optional: false,
          },
        },
        isDynamicFields: true,
        colors: {
          rotatingBacklightColor: {
            main: "#003cff",
            reversed: "#003cff",
          },
          animatedLine: {
            main: "#003cff",
            reversed: "#003cff",
          },
        },
      },
      hybrid_water_systems: {
        id: "hybrid_water_systems",
        title: "hybrid water systems",
        required: false,
        group: "hybrid",
        quantity: envLimits.spo.maxHybridWaterSystemQuantity,
        mappingsByColumns: {
          input: ["flow_temperature", "return_temperature", "status", "room_temperatures"],
          output: ["optimized_flow_temperature"],
          titles: ["name"],
        },
        initMappings: {
          flow_temperature: "",
          return_temperature: "",
          room_temperatures: {},
          status: "",
          optimized_flow_temperature: "",
          name: "",
          max_flow_temperature: { heating: 0, cooling: 0 },
          min_flow_temperature: { heating: 0, cooling: 0 },
          set_point_temperature: { heating: 0, cooling: 0 },
        },
        mappings: {
          flow_temperature: {
            optional: false,
          },
          return_temperature: {
            optional: true,
          },
          room_temperatures: {
            vuetifyComponent: "DynamicFieldWithTitle",
            isDynamic: true,
            optional: false,
            maxRange: 20,
          },
          status: {
            optional: false,
          },
          optimized_flow_temperature: {
            optional: false,
          },
          name: {
            optional: false,
          },
        },
        isDynamicFields: true,
        colors: {
          rotatingBacklightColor: {
            main: colors.red,
            reversed: colors.blue,
          },
          animatedLine: {
            main: colors.red,
            reversed: colors.blue,
          },
        },
      },
      hybrid_air_systems: {
        id: "hybrid_air_systems",
        title: "hybrid air systems",
        required: false,
        group: "hybrid",
        quantity: envLimits.spo.maxHybridAirSystemQuantity,
        mappingsByColumns: {
          input: [
            "flow_temperature",
            "return_temperature",
            "status",
            "in_out_flow_temperature",
            "out_in_flow_temperature",
            "room_temperatures",
          ],
          output: ["optimized_flow_temperature"],
          titles: ["name"],
        },
        initMappings: {
          flow_temperature: "",
          return_temperature: "",
          room_temperatures: {},
          status: "",
          optimized_flow_temperature: "",
          name: "",
          max_flow_temperature: { heating: 0, cooling: 0 },
          min_flow_temperature: { heating: 0, cooling: 0 },
          set_point_temperature: { heating: 0, cooling: 0 },
          in_out_flow_temperature: "",
          out_in_flow_temperature: "",
        },
        mappings: {
          flow_temperature: {
            optional: false,
          },
          return_temperature: {
            optional: false,
          },
          room_temperatures: {
            vuetifyComponent: "DynamicFieldWithTitle",
            isDynamic: true,
            optional: false,
            maxRange: 20,
          },
          status: {
            optional: false,
          },
          optimized_flow_temperature: {
            optional: false,
          },
          name: {
            optional: false,
          },
          in_out_flow_temperature: {
            optional: true,
          },
          out_in_flow_temperature: {
            optional: true,
          },
        },
        isDynamicFields: true,
        colors: {
          rotatingBacklightColor: {
            main: colors.red,
            reversed: colors.blue,
          },
          animatedLine: {
            main: colors.red,
            reversed: colors.blue,
          },
        },
      },
    },
    settingsMappings: ["algorithmModel", "algorithmAdditionalProcessors"],
    manageSchema: "EMSSchema",
    isSettingsView: true,
  },
  LoadMonitor: {
    mappingsByColumns: {
      inputMappings: ["power"],
      outputMappings: ["bakingWindowDuration"],
      middleMappings: ["heartbeat", "errorWarning", "mpcReady"],
    },
    controllerMappings: {
      heartbeat: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
      mpcReady: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
      errorWarning: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
      power: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      bakingWindowDuration: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
        isSystem: false,
      },
    },
    settingsMappings: ["bakingWindowDuration"],
    manageSchema: "DefaultSchema",
    isSettingsView: true,
    additionalRules: [
      async (deviceData: IDevice, rootState: RootState, dispatch: Dispatch) => {
        const newRule = {
          id: "",
          name: `${deviceData.name} Detection Rule`,
          active: true,
          timeout: 1,
          conditions: [
            {
              variable: `LM.${deviceData.id.replaceAll("-", "_").toLowerCase()}.load`,
              and_or: false,
              condition: "equals",
              target: 1,
            },
          ],
          actions: [{ type: "alert", params: { type: 1, body: "{{rule}} - Load was detected" } }],
          created_at: "",
        } as IRule;
        const res = await dispatch("projects/loadProjectOperatingHours", null, { root: true });

        let operating_hours;
        if (res.data) {
          operating_hours = res.data.operating_hours as OperatingSchedule;
        }

        const schedules = [] as IScheduleItem[];
        if (!operating_hours) {
          return newRule;
        }

        Object.keys(operating_hours).forEach((key) => {
          const schedule = operating_hours[key];
          //TODO: holidays are not supported in rule engine
          if (key == "holiday" || !schedule.enabled) {
            return;
          }
          const index = weekdayToIndex(key);
          const activeDays = [false, false, false, false, false, false, false];
          activeDays[index] = schedule.enabled;
          schedules.push({
            timeFrom: {
              hours: schedule.start?.hours,
              minutes: schedule.start?.minutes,
            },
            timeTo: {
              hours: schedule.end?.hours,
              minutes: schedule.end?.minutes,
            },
            activeDays: activeDays,
            timezone: moment.tz.guess(),
          });
        });
        newRule.schedule = schedules;
        return newRule;
      },
    ],
  },
  BakingMonitor: {
    mappingsByColumns: {
      inputMappings: ["power", "powerOverThreshold"],
      outputMappings: [],
      middleMappings: ["heartbeat", "errorWarning", "mpcReady"],
    },
    controllerMappings: {
      heartbeat: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
      mpcReady: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
      errorWarning: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: true,
      },
      power: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      powerOverThreshold: {
        vuetifyComponent: "ComboboxField",
        items: "measurements",
        optional: false,
      },
    },
    manageSchema: "DefaultSchema",
    isSettingsView: true,
  },
};

export default mlModelTypes;
