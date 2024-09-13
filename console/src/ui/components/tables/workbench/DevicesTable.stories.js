import { vueRouter } from "storybook-vue3-router";

import DevicesTableComponent from "./DevicesTable.vue";

export default {
  title: "Tables/Workbench/DevicesTable",
  component: DevicesTableComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DevicesTable = {
  ...Template,
  args: {},
};
