import { vueRouter } from "storybook-vue3-router";

import PVMonitoringServiceComponent from "./index.vue";

export default {
  title: "Devices/Components/Devices/Preview/MPC/PVMonitoringService",
  component: PVMonitoringServiceComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const PVMonitoringService = {
  ...Template,
  args: {},
};
