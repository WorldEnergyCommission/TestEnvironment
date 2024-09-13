import { vueRouter } from "storybook-vue3-router";

import SelectFieldComponent from "./SelectField.vue";

export default {
  title: "Modals/Components/Form/SelectField",
  component: SelectFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const SelectField = {
  ...Template,
  args: {
    label: "Label",
    items: [
      {
        value: "1",
        text: "Item 1",
      },
      {
        value: "2",
        text: "Item 2",
      },
    ],
    itemValue: "value",
    itemText: "text",
    modelValue: "",
  },
};
