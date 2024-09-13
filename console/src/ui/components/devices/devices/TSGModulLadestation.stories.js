import { vueRouter } from "storybook-vue3-router";

import TSGModulLadestationComponent from "./TSGModulLadestation.vue";

export default {
  title: "Devices/Components/Devices/TSGModulLadestation",
  component: TSGModulLadestationComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TSGModulLadestation = {
  ...Template,
  args: {
    deviceData: {
      name: "TSGModulLadestation",
      type: "TSGModulLadestation",
      collection_id: [],
      data: {
        type: "TSGModulLadestation",
        mappings: {
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
          OutputField3_actualValue: "output3",
          OutputField4_actualValue: "output4",
          OutputField5_actualValue: "output1",
          ShowEvent_errorWarningState: "errorState",
        },
      },
    },
  },
};
