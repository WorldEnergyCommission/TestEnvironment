import { vueRouter } from "storybook-vue3-router";

import PreviewsModalComponent from "./PreviewsModal.vue";

export default {
  title: "Modals/PreviewsModal",
  component: PreviewsModalComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const PreviewsModal = {
  ...Template,
  args: {},
};
