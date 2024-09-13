import { vueRouter } from "storybook-vue3-router";

import DialogHeaderComponent from "./DialogHeader.vue";

export default {
  title: "Modals/Components/DialogHeader",
  component: DialogHeaderComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DialogHeader = {
  ...Template,
  args: {
    title: "Title",
  },
};
