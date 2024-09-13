import { vueRouter } from "storybook-vue3-router";

import DevicesComponent from "./Devices.vue";

export default {
  title: "Views/Project/Workbench/Devices",
  component: DevicesComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Devices = {
  ...Template,
  args: {},
};
