import ElectricHeatingSystemInstanceComponent from "./ElectricHeatingSystemInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/ElectricHeatingSystemInstance",
  component: ElectricHeatingSystemInstanceComponent,
};

export const ElectricHeatingSystemInstance = {
  args: {
    systemTypeString: "electric_heating",
    instanceData: {
      power: "actualValue",
      temperature: "actualValue",
      state_electric_heating: "state",
      hour_on: "actualValue",
      minute_on: "actualValue",
      hour_off: "actualValue",
      minute_off: "actualValue",
      target_temp_on: "actualValue",
      target_temp_off: "actualValue",
      target_temp_max: "actualValue",
      slider_manual: "actualValue",
      slider_target_power: "actualValue",
      priority: "actualValue",
      enable_soc: "actualValue",
      disable_soc: "actualValue",
      switch_manual: "state",
      state_manual: "state",
      switch_emergency: "state",
      state_emergency: "state",
      switch_time: "state",
      state_time: "state",
      switch_disable_protection: "state",
      state_disable_protection: "state",
      max_power: "actualValue",
      target_power: "actualValue",
      switch_enable: "state",
      state_enable: "state",
      switch_reset: "state",
      state_reset: "state",
      error: "state",
    },
  },
};
