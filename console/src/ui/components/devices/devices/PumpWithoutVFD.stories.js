import { vueRouter } from "storybook-vue3-router";

import PumpWithoutVFDComponent from "./PumpWithoutVFD.vue";

export default {
  title: "Devices/Components/Devices/PumpWithoutVFD",
  component: PumpWithoutVFDComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const PumpWithoutVFD = {
  ...Template,
  args: {
    deviceData: {
      name: "PumpWithoutVFD",
      type: "PumpWithoutVFD",
      collection_id: [],
      data: {
        type: "PumpWithoutVFD",
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
