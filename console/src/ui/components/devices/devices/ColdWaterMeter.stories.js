import { vueRouter } from "storybook-vue3-router";

import ColdWaterMeterComponent from "./ColdWaterMeter.vue";

export default {
  title: "Devices/Components/Devices/ColdWaterMeter",
  component: ColdWaterMeterComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ColdWaterMeter = {
  ...Template,
  args: {
    deviceData: {
      name: "ColdWaterMeter",
      type: "ColdWaterMeter",
      collection_id: [],
      data: {
        type: "ColdWaterMeter",
        mappings: {
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
        },
      },
    },
  },
};
