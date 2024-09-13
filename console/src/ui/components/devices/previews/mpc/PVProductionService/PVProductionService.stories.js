import { vueRouter } from "storybook-vue3-router";

import PVProductionServiceComponent from "./index.vue";

export default {
  title: "Devices/Components/Devices/Preview/MPC/PVProductionService",
  component: PVProductionServiceComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const PVProductionService = {
  ...Template,
  args: {},
};
