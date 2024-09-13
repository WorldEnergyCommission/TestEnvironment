import { vueRouter } from "storybook-vue3-router";

import VariableTextInputFieldComponent from "./VariableTextInputField.vue";

export default {
  title: "Devices/Components/Devices/VariableTextInputField",
  component: VariableTextInputFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const VariableTextInputField = {
  ...Template,
  args: {
    deviceData: {
      name: "VariableTextInputField",
      type: "VariableTextInputField",
      collection_id: [],
      data: {
        type: "VariableTextInputField",
        mappings: {
          InputFieldText_targetValue: "input",
        },
        meta: {
          cover: "4801556",
        },
      },
    },
  },
};
