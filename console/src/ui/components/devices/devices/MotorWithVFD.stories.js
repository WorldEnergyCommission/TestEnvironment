import { vueRouter } from "storybook-vue3-router";

import MotorWithVFDComponent from "./MotorWithVFD.vue";

export default {
  title: "Devices/Components/Devices/MotorWithVFD",
  component: MotorWithVFDComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MotorWithVFD = {
  ...Template,
  args: {
    deviceData: {
      name: "MotorWithVFD",
      type: "MotorWithVFD",
      collection_id: [],
      data: {
        type: "MotorWithVFD",
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
          Slider_targetValue: "output1",
          OutputField1_actualValue: "output2",
          OutputField_actualValue: "output3",
        },
      },
    },
  },
};
