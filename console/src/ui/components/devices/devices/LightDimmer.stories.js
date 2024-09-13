import { vueRouter } from "storybook-vue3-router";

import LightDimmerComponent from "./LightDimmer.vue";

export default {
  title: "Devices/Components/Devices/LightDimmer",
  component: LightDimmerComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const LightDimmer = {
  ...Template,
  args: {
    deviceData: {
      name: "LightDimmer",
      type: "LightDimmer",
      collection_id: [],
      data: {
        type: "LightDimmer",
        mappings: {
          Switch_on: "state",
          Switch_off: "state",
          Switch_state: "state",
          Slider_targetValue: "output1",
          OutputField_actualValue: "output2",
        },
      },
    },
  },
};
