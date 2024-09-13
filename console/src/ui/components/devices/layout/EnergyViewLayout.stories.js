import EnergyViewLayoutComponent from "./EnergyViewLayout.vue";

export default {
  title: "Devices/Layout/EnergyViewLayout",
  component: EnergyViewLayoutComponent,
};

export const EnergyViewLayout = {
  args: {
    deviceData: {
      name: "Energy View",
      type: "EnergyView",
      data: {
        type: "EnergyView",
      },
    },
    "basic-controls": "Energy View",
    isPreview: false,
  },
};
