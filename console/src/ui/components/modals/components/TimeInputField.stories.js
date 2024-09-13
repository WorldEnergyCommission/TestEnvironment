import { vueRouter } from "storybook-vue3-router";

import TimeInputFieldComponent from "./TimeInputField.vue";

export default {
  title: "Modals/Components/TimeInputField",
  component: TimeInputFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TimeInputField = {
  ...Template,
  args: {
    modelValue: "10:30",
    label: "Label",
    cleareble: true,
  },
};
