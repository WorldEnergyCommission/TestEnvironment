import { vueRouter } from "storybook-vue3-router";

import ElectricityMeterComponent from "./ElectricityMeter.vue";

export default {
  title: "Devices/Components/Devices/ElectricityMeter",
  component: ElectricityMeterComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ElectricityMeter = {
  ...Template,
  args: {
    deviceData: {
      name: "ElectricityMeter",
      type: "ElectricityMeter",
      collection_id: [],
      data: {
        type: "ElectricityMeter",
        mappings: {
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
          OutputField3_actualValue: "output3",
          OutputField4_actualValue: "output4",
          OutputField5_actualValue: "output1",
          OutputField6_actualValue: "output2",
          OutputField7_actualValue: "output3",
        },
      },
    },
  },
};
