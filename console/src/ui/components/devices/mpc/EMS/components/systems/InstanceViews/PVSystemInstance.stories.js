import PVSystemInstanceComponent from "./PVSystemInstance.vue";

export default {
  title: "Devices/MPC/EMS/systems/InstanceView/PVSystemInstance",
  component: PVSystemInstanceComponent,
};

export const PVSystemInstance = {
  args: {
    systemTypeString: "pv",
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
