import { vueRouter } from "storybook-vue3-router";

import TemperatureComponent from "./Temperature.vue";

export default {
  title: "Devices/Components/Devices/Temperature",
  component: TemperatureComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Temperature = {
  ...Template,
  args: {
    deviceData: {
      name: "Temperature",
      type: "Temperature",
      collection_id: [],
      data: {
        type: "Temperature",
        mappings: {
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
