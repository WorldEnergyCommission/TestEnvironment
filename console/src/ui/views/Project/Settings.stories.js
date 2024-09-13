import { vueRouter } from "storybook-vue3-router";

import SettingsComponent from "./Settings.vue";

export default {
  title: "Views/Project/Settings",
  component: SettingsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Settings = {
  ...Template,
  args: {},
};
