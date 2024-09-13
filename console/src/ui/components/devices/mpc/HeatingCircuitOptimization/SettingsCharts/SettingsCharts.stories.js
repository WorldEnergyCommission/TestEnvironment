import { vueRouter } from "storybook-vue3-router";

import SettingsChartsComponent from "./index.vue";

export default {
  title: "Devices/MPC/HeatingCircuitOptimization/SettingsCharts",
  component: SettingsChartsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const SettingsCharts = {
  ...Template,
  args: {
    isPreview: true,
    deviceId: "id",
  },
};
