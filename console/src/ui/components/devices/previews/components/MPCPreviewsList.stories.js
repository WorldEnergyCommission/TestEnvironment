import { vueRouter } from "storybook-vue3-router";

import MPCPreviewsListComponent from "./MPCPreviewsList.vue";

export default {
  title: "Devices/Components/Devices/Preview/Charts/MPCPreviewsList",
  component: MPCPreviewsListComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MPCPreviewsList = {
  ...Template,
  args: {},
};
