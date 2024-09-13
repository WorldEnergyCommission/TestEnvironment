import { vueRouter } from "storybook-vue3-router";

import TSGViewComponent from "./TSGView.vue";

export default {
  title: "Devices/Components/Devices/Preview/Charts/TSGView",
  component: TSGViewComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TSGView = {
  ...Template,
  args: {},
};
