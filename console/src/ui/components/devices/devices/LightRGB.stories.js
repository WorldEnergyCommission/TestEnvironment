import { vueRouter } from "storybook-vue3-router";

import LightRGBComponent from "./LightRGB.vue";

export default {
  title: "Devices/Components/Devices/LightRGB",
  component: LightRGBComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const LightRGB = {
  ...Template,
  args: {
    deviceData: {
      name: "LightRGB",
      type: "LightRGB",
      collection_id: [],
      data: {
        type: "LightRGB",
        mappings: {
          Switch_on: "state",
          Switch_off: "state",
          Switch_state: "state",
          Slider_targetValue: "output1",
          SliderRGB_targetValue_red: "output2",
          SliderRGB_targetValue_green: "output3",
          SliderRGB_targetValue_blue: "output4",
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
          OutputField3_actualValue: "output3",
          OutputField4_actualValue: "output4",
        },
      },
    },
  },
};
