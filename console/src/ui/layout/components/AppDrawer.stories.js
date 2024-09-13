import { vueRouter } from "storybook-vue3-router";

import AppDrawerComponent from "./AppDrawer.vue";

export default {
  title: "Layout/AppDrawer",
  component: AppDrawerComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const AppDrawer = {
  ...Template,
  args: {},
};
