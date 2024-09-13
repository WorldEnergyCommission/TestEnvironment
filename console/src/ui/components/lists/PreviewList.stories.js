import { vueRouter } from "storybook-vue3-router";

import PreviewListComponent from "./PreviewList.vue";

export default {
  title: "Lists/PreviewList",
  component: PreviewListComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const PreviewList = {
  ...Template,
  args: {},
};
