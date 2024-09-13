import { vueRouter } from "storybook-vue3-router";

import HeatingMeterComponent from "./HeatingMeter.vue";

export default {
  title: "Devices/Components/Devices/HeatingMeter",
  component: HeatingMeterComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const HeatingMeter = {
  ...Template,
  args: {
    deviceData: {
      name: "HeatingMeter",
      type: "HeatingMeter",
      collection_id: [],
      data: {
        type: "HeatingMeter",
        mappings: {
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
          OutputField3_actualValue: "output3",
          OutputField4_actualValue: "output4",
          OutputField5_actualValue: "output1",
          OutputField6_actualValue: "output2",
          OutputField7_actualValue: "output3",
          OutputField8_actualValue: "output4",
          OutputField9_actualValue: "output1",
        },
      },
    },
  },
};
