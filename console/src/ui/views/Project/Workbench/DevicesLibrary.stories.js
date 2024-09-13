import { vueRouter } from "storybook-vue3-router";

import DevicesLibraryComponent from "./DevicesLibrary.vue";

export default {
  title: "Views/Project/Workbench/DevicesLibrary",
  component: DevicesLibraryComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DevicesLibrary = {
  ...Template,
  args: {},
};
