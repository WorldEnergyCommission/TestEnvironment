import { vueRouter } from "storybook-vue3-router";

import BatteryComponent from "./Battery.vue";

export default {
  title: "Devices/Components/Devices/Battery",
  component: BatteryComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Battery = {
  ...Template,
  args: {
    deviceData: {
      name: "Battery",
      type: "Battery",
      collection_id: [],
      data: {
        type: "Battery",
        mappings: {
          Battery_actualValue: "actualValue",
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
          OutputField3_actualValue: "output3",
          OutputField4_actualValue: "output4",
        },
      },
    },
  },
};
