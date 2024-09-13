import { vueRouter } from "storybook-vue3-router";

import ProjectComponent from "./index.vue";

export default {
  title: "Views/Project/Project",
  component: ProjectComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Project = {
  ...Template,
  args: {},
};
