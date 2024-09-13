import { vueRouter } from "storybook-vue3-router";

import MotorWithoutVFDComponent from "./MotorWithoutVFD.vue";

export default {
  title: "Devices/Components/Devices/MotorWithoutVFD",
  component: MotorWithoutVFDComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MotorWithoutVFD = {
  ...Template,
  args: {
    deviceData: {
      name: "MotorWithoutVFD",
      type: "MotorWithoutVFD",
      collection_id: [],
      data: {
        type: "MotorWithoutVFD",
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
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
