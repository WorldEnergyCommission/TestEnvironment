import { vueRouter } from "storybook-vue3-router";

import IndicatorComponent from "./Indicator.vue";

export default {
  title: "Devices/Components/Devices/Indicator",
  component: IndicatorComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Indicator = {
  ...Template,
  args: {
    deviceData: {
      name: "Indicator",
      type: "Indicator",
      collection_id: [],
      data: {
        type: "Indicator",
        mappings: {
          Indicator_onOff: "state",
        },
        meta: {
          cover: "4801555",
        },
      },
    },
  },
};
