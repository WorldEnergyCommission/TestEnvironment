import HeatMeterInstanceComponent from "./HeatMeterInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/HeatMeterInstance",
  component: HeatMeterInstanceComponent,
};

export const HeatMeterInstance = {
  args: {
    systemTypeString: "heat_meter",
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
      slider_manual: "actualValue",
      manual_power: "actualValue",
      slider_power: "actualValue",
      state_time_power: "actualValue",
      priority: "actualValue",
      enable_soc: "actualValue",
      disable_soc: "actualValue",
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
