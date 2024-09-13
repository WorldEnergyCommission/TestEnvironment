import { vueRouter } from "storybook-vue3-router";

import AppComponent from "./App.vue";

export default {
  title: "App",
  component: AppComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const App = {
  ...Template,
  args: {},
};
