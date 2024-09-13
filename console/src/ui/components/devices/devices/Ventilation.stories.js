import { vueRouter } from "storybook-vue3-router";

import VentilationComponent from "./Ventilation.vue";

export default {
  title: "Devices/Components/Devices/Ventilation",
  component: VentilationComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Ventilation = {
  ...Template,
  args: {
    deviceData: {
      name: "Ventilation",
      type: "Ventilation",
      collection_id: [],
      data: {
        type: "Ventilation",
        mappings: {
          InputField_targetValue: "input",
          Switch_on: "state",
          Switch_off: "state",
          Switch_state: "state",
          PushButton_onOff: "state",
          PushButton_state: "state",
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
        },
      },
    },
  },
};
