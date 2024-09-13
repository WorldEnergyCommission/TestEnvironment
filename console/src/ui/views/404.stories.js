import { vueRouter } from "storybook-vue3-router";

import NotFoundComponent from "./404.vue";

export default {
  title: "Views/NotFound",
  component: NotFoundComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const NotFound = {
  ...Template,
  args: {},
};
