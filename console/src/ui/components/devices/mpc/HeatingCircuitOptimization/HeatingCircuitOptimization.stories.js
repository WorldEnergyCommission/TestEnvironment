import { vueRouter } from "storybook-vue3-router";

import HeatingCircuitOptimizationComponent from "./index.vue";

export default {
  title: "Devices/MPC/HeatingCircuitOptimization/HeatingCircuitOptimization",
  component: HeatingCircuitOptimizationComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const HeatingCircuitOptimization = {
  ...Template,
  args: {
    deviceData: {
      name: "HeatingCircuitOptimization",
      type: "HeatingCircuitOptimization",
      collection_id: [],
      data: {
        type: "HeatingCircuitOptimization",
        mappings: {},
        meta: {
          timing: {
            high_set_temperature: 10,
          },
          additionalAreas: [],
          controllerMappings: {},
        },
      },
    },
  },
};
