import { vueRouter } from "storybook-vue3-router";

import VariablesComponent from "./Variables.vue";

export default {
  title: "Lists/SettingsList/Variables",
  component: VariablesComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Variables = {
  ...Template,
  args: {},
};
