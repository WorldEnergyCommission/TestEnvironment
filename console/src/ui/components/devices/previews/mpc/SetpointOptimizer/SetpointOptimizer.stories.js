import { vueRouter } from "storybook-vue3-router";

import SetpointOptimizerComponent from "./index.vue";

export default {
  title: "Devices/Components/Devices/Preview/MPC/SetpointOptimizer",
  component: SetpointOptimizerComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const SetpointOptimizer = {
  ...Template,
  args: {},
};
