import { vueRouter } from "storybook-vue3-router";

import VariableTextOutputFieldComponent from "./VariableTextOutputField.vue";

export default {
  title: "Devices/Components/Devices/VariableTextOutputField",
  component: VariableTextOutputFieldComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const VariableTextOutputField = {
  ...Template,
  args: {
    deviceData: {
      name: "VariableTextOutputField",
      type: "VariableTextOutputField",
      collection_id: [],
      data: {
        type: "VariableTextOutputField",
        mappings: {
          OutputFieldText_actualValue: "output1",
        },
        meta: {
          cover: "4801552",
        },
      },
    },
  },
};
