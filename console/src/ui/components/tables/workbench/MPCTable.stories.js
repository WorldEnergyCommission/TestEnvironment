import { vueRouter } from "storybook-vue3-router";

import MPCTableComponent from "./MPCTable.vue";

export default {
  title: "Tables/Workbench/MPCTable",
  component: MPCTableComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MPCTable = {
  ...Template,
  args: {},
};
