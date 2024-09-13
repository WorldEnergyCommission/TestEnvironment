import { vueRouter } from "storybook-vue3-router";

import PVMonitoringServiceComponent from "./index.vue";

export default {
  title: "Devices/MPC/PVMonitoringService/PVMonitoringService",
  component: PVMonitoringServiceComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const PVMonitoringService = {
  ...Template,
  args: {
    deviceData: {
      name: "PVMonitoringService",
      type: "PVMonitoringService",
      id: "PVMonitoringService",
      collection_id: [],
      data: {
        type: "PVMonitoringService",
        mappings: {},
        meta: {
          controllerMappings: {},
        },
      },
    },
  },
};
