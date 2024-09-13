import ChargeStationSystemInstanceComponent from "./ChargeStationSystemInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/ChargeStationSystemInstance",
  component: ChargeStationSystemInstanceComponent,
};

export const ChargeStationSystemInstance = {
  args: {
    systemTypeString: "charge_station",
    instanceData: {
      power: "actualValue",
      car_connected: "actualValue",
      charging_time: "actualValue",
      state_charging_station: "state",
      priority: "actualValue",
      enable_soc: "actualValue",
      disable_soc: "actualValue",
      max_power: "actualValue",
      slider_manual: "actualValue",
      slider_target_power: "actualValue",
      slider_min_power: "actualValue",
      min_power: "actualValue",
      switch_manual: "state",
      state_manual: "state",
      switch_emergency: "state",
      state_emergency: "state",
      target_power: "actualValue",
      switch_enable: "state",
      state_enable: "state",
      switch_reset: "state",
      state_reset: "state",
      error: "state",
    },
  },
};
