import { vueRouter } from "storybook-vue3-router";

import MotionSensorComponent from "./MotionSensor.vue";

export default {
  title: "Devices/Components/Devices/MotionSensor",
  component: MotionSensorComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MotionSensor = {
  ...Template,
  args: {
    deviceData: {
      name: "MotionSensor",
      type: "MotionSensor",
      collection_id: [],
      data: {
        type: "MotionSensor",
        mappings: {
          InputField_targetValue: "input",
          Switch_on: "state",
          Switch_off: "state",
          Switch_state: "state",
          PushButton_onOff: "state",
          PushButton_state: "state",
        },
      },
    },
  },
};
