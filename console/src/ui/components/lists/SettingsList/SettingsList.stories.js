import { vueRouter } from "storybook-vue3-router";

import SettingsListComponent from "./index.vue";

export default {
  title: "Lists/SettingsList/SettingsList",
  component: SettingsListComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const SettingsList = {
  ...Template,
  args: {},
};
