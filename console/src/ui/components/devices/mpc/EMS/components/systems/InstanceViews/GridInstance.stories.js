import GridInstanceComponent from "./GridInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/GridInstance",
  component: GridInstanceComponent,
};

export const GridInstance = {
  args: {
    systemTypeString: "grid",
    instanceData: {
      power: "actualValue",
      size: "actualValue",
      target_power: "actualValue",
      switch_enable: "state",
      state_enable: "state",
      switch_reset: "state",
      state_reset: "state",
      error: "state",
    },
  },
};
