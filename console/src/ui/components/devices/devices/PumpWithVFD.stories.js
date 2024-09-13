import { vueRouter } from "storybook-vue3-router";

import PumpWithVFDComponent from "./PumpWithVFD.vue";

export default {
  title: "Devices/Components/Devices/PumpWithVFD",
  component: PumpWithVFDComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const PumpWithVFD = {
  ...Template,
  args: {
    deviceData: {
      name: "PumpWithVFD",
      type: "PumpWithVFD",
      collection_id: [],
      data: {
        type: "PumpWithVFD",
        mappings: {
          PushButton1_onOff: "state",
          PushButton1_state: "state",
          PushButton2_onOff: "state",
          PushButton2_state: "state",
          PushButton3_onOff: "state",
          PushButton3_state: "state",
          PushButton4_onOff: "state",
          PushButton4_state: "state",
          ArrowLeft_commandLeft: "state",
          ArrowLeft_state: "state",
          ArrowRight_commandRight: "state",
          ArrowRight_state: "state",
          OutputField1_actualValue: "output1",
          Slider_targetValue: "output2",
          OutputField_actualValue: "output3",
        },
      },
    },
  },
};
