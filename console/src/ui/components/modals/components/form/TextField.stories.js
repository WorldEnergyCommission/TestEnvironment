import { vueRouter } from "storybook-vue3-router";

import TextFieldComponent from "./TextField.vue";

export default {
  title: "Modals/Components/Form/TextField",
  component: TextFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TextField = {
  ...Template,
  args: {
    label: "Label",
    maxLength: 4,
    modelValue: "",
  },
};
