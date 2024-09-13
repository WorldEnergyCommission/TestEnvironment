import { vueRouter } from "storybook-vue3-router";

import SensorCO2Component from "./SensorCO2.vue";

export default {
  title: "Devices/Components/Devices/SensorCO2",
  component: SensorCO2Component,
};

const Template = {
  decorators: [vueRouter()],
};

export const SensorCO2 = {
  ...Template,
  args: {
    deviceData: {
      name: "SensorCO2",
      type: "SensorCO2",
      collection_id: [],
      data: {
        type: "SensorCO2",
        mappings: {
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
