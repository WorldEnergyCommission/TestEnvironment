import { vueRouter } from "storybook-vue3-router";

import ConsumptionServiceComponent from "./index.vue";

export default {
  title: "Devices/MPC/ConsumptionService/ConsumptionService",
  component: ConsumptionServiceComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ConsumptionService = {
  ...Template,
  args: {
    deviceData: {
      name: "ConsumptionService",
      type: "ConsumptionService",
      collection_id: [],
      data: {
        type: "ConsumptionService",
        meta: {
          chartScaling: "12",
        },
      },
    },
  },
};
