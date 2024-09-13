import { vueRouter } from "storybook-vue3-router";

import GeneratorComponent from "./Generator.vue";

export default {
  title: "Devices/Components/Devices/Generator",
  component: GeneratorComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Generator = {
  ...Template,
  args: {
    deviceData: {
      name: "Generator",
      type: "Generator",
      collection_id: [],
      data: {
        type: "Generator",
        mappings: {
          Switch_on: "state",
          Switch_off: "state",
          Switch_state: "state",
          PushButton_onOff: "state",
          PushButton_state: "state",
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
