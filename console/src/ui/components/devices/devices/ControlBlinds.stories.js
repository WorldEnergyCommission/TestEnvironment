import { vueRouter } from "storybook-vue3-router";

import ControlBlindsComponent from "./ControlBlinds.vue";

export default {
  title: "Devices/Components/Devices/ControlBlinds",
  component: ControlBlindsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ControlBlinds = {
  ...Template,
  args: {
    deviceData: {
      name: "ControlBlinds",
      type: "ControlBlinds",
      collection_id: [],
      data: {
        type: "ControlBlinds",
        mappings: {
          ArrowUp_up: "state",
          ArrowUp_state: "state",
          ArrowDown_down: "state",
          ArrowDown_state: "state",
          PushButton_onOff: "state",
          PushButton_state: "state",
          DropDown_targetValue: "actualValue",
          Slider_targetValue: "output2",
          OutputField_actualValue: "output1",
          InputField1_targetValue: "input",
          InputField2_targetValue: "input",
          InputField3_targetValue: "input",
        },
      },
    },
  },
};
