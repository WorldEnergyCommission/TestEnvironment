import { vueRouter } from "storybook-vue3-router";

import WeatherStationComponent from "./WeatherStation.vue";

export default {
  title: "Devices/Components/Devices/WeatherStation",
  component: WeatherStationComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const WeatherStation = {
  ...Template,
  args: {
    deviceData: {
      name: "WeatherStation",
      type: "WeatherStation",
      collection_id: [],
      data: {
        type: "WeatherStation",
        mappings: {
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
          OutputField3_actualValue: "output3",
          OutputField4_actualValue: "output4",
          OutputField5_actualValue: "output1",
          OutputField6_actualValue: "output2",
          OutputField7_actualValue: "output3",
        },
      },
    },
  },
};
