import { vueRouter } from "storybook-vue3-router";

import ControlShutterComponent from "./ControlShutter.vue";

export default {
  title: "Devices/Components/Devices/ControlShutter",
  component: ControlShutterComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ControlShutter = {
  ...Template,
  args: {
    deviceData: {
      name: "ControlShutter",
      type: "ControlShutter",
      collection_id: [],
      data: {
        type: "ControlShutter",
        mappings: {
          ArrowUp_up: "state",
          ArrowUp_state: "state",
          ArrowDown_down: "state",
          ArrowDown_state: "state",
          PushButton_onOff: "state",
          PushButton_state: "state",
          Slider_targetValue: "output2",
          OutputField_actualValue: "output1",
          InputField1_targetValue: "input",
          InputField2_targetValue: "input",
        },
      },
    },
  },
};
