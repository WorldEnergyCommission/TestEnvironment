import { vueRouter } from "storybook-vue3-router";

import SensorLevelComponent from "./SensorLevel.vue";

export default {
  title: "Devices/Components/Devices/SensorLevel",
  component: SensorLevelComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const SensorLevel = {
  ...Template,
  args: {
    deviceData: {
      name: "SensorLevel",
      type: "SensorLevel",
      collection_id: [],
      data: {
        type: "SensorLevel",
        mappings: {
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
