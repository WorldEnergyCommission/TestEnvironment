import { vueRouter } from "storybook-vue3-router";

import SettingsChartsComponent from "./index.vue";

export default {
  title: "Devices/MPC/PVProductionService/SettingsCharts",
  component: SettingsChartsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const SettingsCharts = {
  ...Template,
  args: {},
};
