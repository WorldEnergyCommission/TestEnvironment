import { vueRouter } from "storybook-vue3-router";

import WorkbenchComponent from "./Workbench.vue";

export default {
  title: "Views/Project",
  component: WorkbenchComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const WorkbenchView = {
  ...Template,
  args: {},
};
