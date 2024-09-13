import HeatingPumpSystemInstanceComponent from "./HeatingPumpSystemInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/HeatingPumpSystemInstance",
  component: HeatingPumpSystemInstanceComponent,
};

export const HeatingPumpSystemInstance = {
  args: {
    systemTypeString: "heating_pump",
    instanceData: {
      power: "actualValue",
      temperature: "actualValue",
      state_heating_pump: "state",
      flow_temperature: "actualValue",
      return_temperature: "actualValue",
      inlet_temperature: "actualValue",
      outlet_temperature: "actualValue",
      boiler_temperature: "actualValue",
      boiler_water_temperature: "actualValue",
      hour_on: "actualValue",
      minute_on: "actualValue",
      hour_off: "actualValue",
      minute_off: "actualValue",
      priority: "actualValue",
      disable_soc: "actualValue",
      enable_soc: "state",
      slider_manual: "actualValue",
      manual_power: "actualValue",
      slider_power: "actualValue",
      state_time_power: "actualValue",
      switch_manual: "state",
      state_manual: "state",
      switch_emergency: "state",
      state_emergency: "state",
      switch_time: "state",
      state_time: "state",
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
