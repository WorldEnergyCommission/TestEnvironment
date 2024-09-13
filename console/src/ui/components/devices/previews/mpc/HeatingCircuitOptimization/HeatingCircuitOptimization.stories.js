import { vueRouter } from "storybook-vue3-router";

import HeatingCircuitOptimizationComponent from "./index.vue";

export default {
  title: "Devices/Components/Devices/Preview/MPC/HeatingCircuitOptimization",
  component: HeatingCircuitOptimizationComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const HeatingCircuitOptimization = {
  ...Template,
  args: {},
};
