import { vueRouter } from "storybook-vue3-router";

import DevicesViewComponent from "./DevicesView.vue";

export default {
  title: "Devices/Components/Devices/Preview/Charts/DevicesView",
  component: DevicesViewComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DevicesView = {
  ...Template,
  args: {},
};
