import { vueRouter } from "storybook-vue3-router";

import FormComponent from "./Form.vue";

export default {
  title: "Modals/InviteMember/Form",
  component: FormComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Form = {
  ...Template,
  args: {},
};
