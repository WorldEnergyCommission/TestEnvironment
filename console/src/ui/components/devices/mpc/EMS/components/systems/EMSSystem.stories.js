import EMSSystemComponent from "./EMSSystem.vue";

export default {
  title: "Devices/MPC/EMS/systems/EMSSystem",
  component: EMSSystemComponent,
};

export const EMSSystem = {
  args: {
    instanceViewLabel: "Label",
    systemProps: {
      systemTypeString: "pv",
      systemData: {
        pv1: {
          power: "actualValue",
        },
        pv2: {
          power: "actualValue",
        },
      },
    },
  },
};
