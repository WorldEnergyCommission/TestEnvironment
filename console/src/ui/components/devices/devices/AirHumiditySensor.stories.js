import { vueRouter } from "storybook-vue3-router";

import AirHumiditySensorComponent from "./AirHumiditySensor.vue";

export default {
  title: "Devices/Components/Devices/AirHumiditySensor",
  component: AirHumiditySensorComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const AirHumiditySensor = {
  ...Template,
  args: {
    deviceData: {
      name: "AirHumiditySensor",
      type: "AirHumiditySensor",
      collection_id: [],
      data: {
        type: "AirHumiditySensor",
        mappings: {
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
