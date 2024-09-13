import { vueRouter } from "storybook-vue3-router";

import MonitoringGaugeComponent from "./MonitoringGauge.vue";

export default {
  title: "Devices/MPC/PVMonitoringService/MonitoringGauge",
  component: MonitoringGaugeComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MonitoringGauge = {
  ...Template,
  args: {
    deviceData: {
      name: "MonitoringGauge",
      type: "MonitoringGauge",
      id: "MonitoringGauge",
      collection_id: [],
      data: {
        type: "MonitoringGauge",
        mappings: {},
        meta: {
          controllerMappings: {},
        },
      },
    },
    inputVariable: "actualValue",
  },
};
