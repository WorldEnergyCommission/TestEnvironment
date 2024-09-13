import { vueRouter } from "storybook-vue3-router";

import EMSComponent from "./index.vue";

export default {
  title: "Devices/Components/Devices/Preview/MPC/EMS",
  component: EMSComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EMS = {
  ...Template,
  args: {},
};
