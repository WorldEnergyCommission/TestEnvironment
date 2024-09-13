import { vueRouter } from "storybook-vue3-router";

import VariableInputFieldComponent from "./VariableInputField.vue";

export default {
  title: "Devices/Components/Devices/VariableInputField",
  component: VariableInputFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const VariableInputField = {
  ...Template,
  args: {
    deviceData: {
      name: "VariableInputField",
      type: "VariableInputField",
      collection_id: [],
      data: {
        type: "VariableInputField",
        mappings: {
          InputField_targetValue: "input",
        },
        meta: {
          cover: "4801555",
          unit: "kW",
        },
      },
    },
  },
};
