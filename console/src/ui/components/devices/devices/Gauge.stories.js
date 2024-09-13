import { vueRouter } from "storybook-vue3-router";

import GaugeComponent from "./Gauge.vue";

export default {
  title: "Devices/Components/Devices/Gauge",
  component: GaugeComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Gauge = {
  ...Template,
  args: {
    deviceData: {
      name: "Gauge",
      type: "Gauge",
      collection_id: [],
      data: {
        type: "Gauge",
        mappings: {
          CurrentValueGaugeChart_actualValue: "actualValue",
        },
        meta: {
          scaling: {
            min: "0",
            max: "100",
          },
          unit: "kW",
        },
      },
    },
  },
};
