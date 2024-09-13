import { vueRouter } from "storybook-vue3-router";

import DatePickerCustomComponent from "./DatePickerCustom.vue";

export default {
  title: "Modals/Components/DatePickerCustom",
  component: DatePickerCustomComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DatePickerCustom = {
  ...Template,
  args: {
    modelValue: 1710320640,
    label: "Label",
  },
};
