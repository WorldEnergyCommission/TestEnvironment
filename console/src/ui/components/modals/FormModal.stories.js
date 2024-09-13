import { vueRouter } from "storybook-vue3-router";

import FormModalComponent from "./FormModal.vue";

export default {
  title: "Modals/FormModal",
  component: FormModalComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const FormModal = {
  ...Template,
  args: {
    activator: "Click to show form modal",
    content: "Form modal content",
  },
};
