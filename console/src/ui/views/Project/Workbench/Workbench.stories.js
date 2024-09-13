import { vueRouter } from "storybook-vue3-router";

import WorkbenchComponent from "./index.vue";

export default {
  title: "Views/Project/Workbench/Workbench",
  component: WorkbenchComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Workbench = {
  ...Template,
  args: {},
};
