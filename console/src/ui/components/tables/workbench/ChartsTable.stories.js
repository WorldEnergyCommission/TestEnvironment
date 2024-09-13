import { vueRouter } from "storybook-vue3-router";

import ChartsTableComponent from "./ChartsTable.vue";

export default {
  title: "Tables/Workbench/ChartsTable",
  component: ChartsTableComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ChartsTable = {
  ...Template,
  args: {},
};
