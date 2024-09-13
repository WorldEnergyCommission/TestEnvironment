import BatterySystemInstanceComponent from "./BatterySystemInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/BatterySystemInstance",
  component: BatterySystemInstanceComponent,
};

export const BatterySystemInstance = {
  args: {
    systemTypeString: "battery",
    instanceData: {
      power: "actualValue",
      soc: "actualValue",
      capacity: "actualValue",
      priority: "actualValue",
      size_capacity: "actualValue",
      target_power: "actualValue",
      switch_enable: "state",
      state_enable: "state",
      switch_reset: "state",
      state_reset: "state",
      error: "state",
    },
  },
};
