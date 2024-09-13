import { vueRouter } from "storybook-vue3-router";

import ControlAwningComponent from "./ControlAwning.vue";

export default {
  title: "Devices/Components/Devices/ControlAwning",
  component: ControlAwningComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ControlAwning = {
  ...Template,
  args: {
    deviceData: {
      name: "ControlAwning",
      type: "ControlAwning",
      collection_id: [],
      data: {
        type: "ControlAwning",
        mappings: {
          ArrowOut_out: "state",
          ArrowOut_state: "state",
          ArrowIn_in: "state",
          ArrowIn_state: "state",
          PushButton_onOff: "state",
          PushButton_state: "state",
          Slider_targetValue: "actualValue",
          OutputField_actualValue: "output1",
          InputField1_targetValue: "input",
          InputField2_targetValue: "input",
        },
      },
    },
  },
};
