import { vueRouter } from "storybook-vue3-router";

import VariableOutputFieldComponent from "./VariableOutputField.vue";

export default {
  title: "Devices/Components/Devices/VariableOutputField",
  component: VariableOutputFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const VariableOutputField = {
  ...Template,
  args: {
    deviceData: {
      name: "VariableOutputField",
      type: "VariableOutputField",
      collection_id: [],
      data: {
        type: "VariableOutputField",
        mappings: {
          OutputField_actualValue: "output1",
        },
        meta: {
          cover: "4801550",
          unit: "kW",
        },
      },
    },
  },
};
