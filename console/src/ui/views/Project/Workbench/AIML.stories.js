import { vueRouter } from "storybook-vue3-router";

import AIMLComponent from "./AIML.vue";

export default {
  title: "Views/Project/Workbench/AIML",
  component: AIMLComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const AIML = {
  ...Template,
  args: {},
};
