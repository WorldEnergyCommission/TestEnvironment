import HouseSystemInstanceComponent from "./HouseSystemInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/HouseSystemInstance",
  component: HouseSystemInstanceComponent,
};

export const HouseSystemInstance = {
  args: {
    systemTypeString: "house",
    instanceData: {
      power: "actualValue",
      target_power: "actualValue",
      switch_enable: "state",
      state_enable: "state",
      switch_reset: "state",
      state_reset: "state",
      error: "state",
    },
  },
};
