import { vueRouter } from "storybook-vue3-router";

import ConsumptionServiceComponent from "./index.vue";

export default {
  title: "Devices/Components/Devices/Preview/MPC/ConsumptionService",
  component: ConsumptionServiceComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ConsumptionService = {
  ...Template,
  args: {},
};
