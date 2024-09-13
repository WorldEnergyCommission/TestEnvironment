import { vueRouter } from "storybook-vue3-router";

import AppLayoutComponent from "./AppLayout.vue";

export default {
  title: "Layout/AppLayout",
  component: AppLayoutComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const AppLayout = {
  ...Template,
  args: {},
};
