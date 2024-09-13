import { vueRouter } from "storybook-vue3-router";

import DynamicFieldWithTitleComponent from "./DynamicFieldWithTitle.vue";

export default {
  title: "Modals/Components/DynamicFieldWithTitle",
  component: DynamicFieldWithTitleComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DynamicFieldWithTitle = {
  ...Template,
  args: {
    isOptional: false,
    modelValue: {
      item1: {
        variable: "",
        title: "",
      },
    },
    label: "Label",
    itemsList: ["item1", "item2"],
    maxNumberOfFields: 2,
  },
};
