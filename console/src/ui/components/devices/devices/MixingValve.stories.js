import { vueRouter } from "storybook-vue3-router";

import MixingValveComponent from "./MixingValve.vue";

export default {
  title: "Devices/Components/Devices/MixingValve",
  component: MixingValveComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MixingValve = {
  ...Template,
  args: {
    deviceData: {
      name: "MixingValve",
      type: "MixingValve",
      collection_id: [],
      data: {
        type: "MixingValve",
        mappings: {
          PushButton1_onOff: "state",
          PushButton1_state: "state",
          PushButton2_onOff: "state",
          PushButton2_state: "state",
          PushButton3_onOff: "state",
          PushButton3_state: "state",
          PushButton4_onOff: "state",
          PushButton4_state: "state",
          Slider_targetValue: "output1",
          OutputField_actualValue: "output2",
        },
      },
    },
  },
};
