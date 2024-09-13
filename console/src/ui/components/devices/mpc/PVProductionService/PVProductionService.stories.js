import { vueRouter } from "storybook-vue3-router";

import PVProductionServiceComponent from "./index.vue";

export default {
  title: "Devices/MPC/PVProductionService/PVProductionService",
  component: PVProductionServiceComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const PVProductionService = {
  ...Template,
  args: {
    deviceData: {
      name: "PVProductionService",
      type: "PVProductionService",
      collection_id: [],
      data: {
        type: "PVProductionService",
        meta: {
          chartScaling: "12",
        },
      },
    },
  },
};
