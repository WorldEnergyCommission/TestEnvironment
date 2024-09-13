import { vueRouter } from "storybook-vue3-router";

import InputFieldNumberComponent from "./InputFieldNumber.vue";

export default {
  title: "Modals/Components/InputFieldNumber",
  component: InputFieldNumberComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const InputFieldNumber = {
  ...Template,
  args: {
    modelValue: "",
    isDecimal: true,
    disabled: false,
    step: 1,
    min: 0,
    max: 100,
    small: false,
    label: "Label",
  },
};
