import { vueRouter } from "storybook-vue3-router";

import BrightnessSensorComponent from "./BrightnessSensor.vue";

export default {
  title: "Devices/Components/Devices/BrightnessSensor",
  component: BrightnessSensorComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const BrightnessSensor = {
  ...Template,
  args: {
    deviceData: {
      name: "BrightnessSensor",
      type: "BrightnessSensor",
      collection_id: [],
      data: {
        type: "BrightnessSensor",
        mappings: {
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
