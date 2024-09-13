import { vueRouter } from "storybook-vue3-router";

import ChartsComponent from "./Charts.vue";

export default {
  title: "Devices/MPC/ConsumptionService/Charts",
  component: ChartsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Charts = {
  ...Template,
  args: {},
};
