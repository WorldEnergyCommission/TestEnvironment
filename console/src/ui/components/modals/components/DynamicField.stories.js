import { vueRouter } from "storybook-vue3-router";

import DynamicFieldComponent from "./DynamicField.vue";

export default {
  title: "Modals/Components/DynamicField",
  component: DynamicFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DynamicField = {
  ...Template,
  args: {
    isOptional: false,
    modelValue: {
      item1: "",
    },
    label: "Label",
    itemsList: ["item1", "item2"],
    maxNumberOfFields: 2,
  },
};
