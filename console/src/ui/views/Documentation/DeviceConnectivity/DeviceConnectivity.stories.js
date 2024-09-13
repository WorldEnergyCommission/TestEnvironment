import { vueRouter } from "storybook-vue3-router";

import DeviceConnectivityComponent from "./index.vue";

export default {
  title: "Views/Documentation/DeviceConnectivity/DeviceConnectivity",
  component: DeviceConnectivityComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DeviceConnectivity = {
  ...Template,
  args: {},
};
