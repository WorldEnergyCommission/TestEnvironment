import { vueRouter } from "storybook-vue3-router";

import MLModelsComponent from "./MLModels.vue";

export default {
  title: "Views/Project/Workbench/MLModels",
  component: MLModelsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MLModels = {
  ...Template,
  args: {},
};
