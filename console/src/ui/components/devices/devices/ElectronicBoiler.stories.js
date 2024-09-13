import { vueRouter } from "storybook-vue3-router";

import ElectronicBoilerComponent from "./ElectronicBoiler.vue";

export default {
  title: "Devices/Components/Devices/ElectronicBoiler",
  component: ElectronicBoilerComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ElectronicBoiler = {
  ...Template,
  args: {
    deviceData: {
      name: "ElectronicBoiler",
      type: "ElectronicBoiler",
      collection_id: [],
      data: {
        type: "ElectronicBoiler",
        mappings: {
          OutputField1_actualValue: "output1",
          OutputField_actualValue: "output2",
          InputField1_targetValue: "input",
          InputField2_targetValue: "input",
          InputField3_targetValue: "input",
          InputField4_targetValue: "input",
          Switch1_on: "state",
          Switch1_off: "state",
          Switch1_state: "state",
          Switch2_on: "state",
          Switch2_off: "state",
          Switch2_state: "state",
          Slider_targetValue: "output3",
        },
      },
    },
  },
};
