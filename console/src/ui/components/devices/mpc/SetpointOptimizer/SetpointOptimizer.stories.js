import { vueRouter } from "storybook-vue3-router";

import SetpointOptimizerComponent from "./SPO.vue";

export default {
  title: "Devices/MPC/SetpointOptimizer/SetpointOptimizer",
  component: SetpointOptimizerComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const SetpointOptimizer = {
  ...Template,
  args: {
    isPreview: true,
    deviceData: {
      name: "SetpointOptimizer",
      type: "SetpointOptimizer",
      data: {
        type: "SetpointOptimizer",
      },
    },
  },
};
