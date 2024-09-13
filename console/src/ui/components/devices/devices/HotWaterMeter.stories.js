import { vueRouter } from "storybook-vue3-router";

import HotWaterMeterComponent from "./HotWaterMeter.vue";

export default {
  title: "Devices/Components/Devices/HotWaterMeter",
  component: HotWaterMeterComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const HotWaterMeter = {
  ...Template,
  args: {
    deviceData: {
      name: "HotWaterMeter",
      type: "HotWaterMeter",
      collection_id: [],
      data: {
        type: "HotWaterMeter",
        mappings: {
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
        },
      },
    },
  },
};
