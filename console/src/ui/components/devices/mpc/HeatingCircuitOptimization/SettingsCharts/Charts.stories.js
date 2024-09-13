import { vueRouter } from "storybook-vue3-router";

import ChartsComponent from "./Charts.vue";

export default {
  title: "Devices/MPC/HeatingCircuitOptimization/Charts",
  component: ChartsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Charts = {
  ...Template,
  args: {
    isPreview: true,
    deviceId: "id",
  },
};
