import { vueRouter } from "storybook-vue3-router";

import ComboboxFieldComponent from "./ComboboxField.vue";

export default {
  title: "Modals/Components/Form/ComboboxField",
  component: ComboboxFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ComboboxField = {
  ...Template,
  args: {
    label: "Label",
    items: ["Item 1", "Item 2"],
  },
};
