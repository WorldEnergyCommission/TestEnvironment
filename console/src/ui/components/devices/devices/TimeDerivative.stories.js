import { vueRouter } from "storybook-vue3-router";

import TimeDerivativeComponent from "./TimeDerivative.vue";

export default {
  title: "Devices/Components/Devices/TimeDerivative",
  component: TimeDerivativeComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TimeDerivative = {
  ...Template,
  args: {
    deviceData: {
      name: "TimeDerivative",
      type: "TimeDerivative",
      collection_id: [],
      data: {
        type: "TimeDerivative",
        mappings: {
          TimeDerivative_sourceVariable: "actualValue",
        },
        meta: {
          cover: "4801530",
          unit: "kW",
          interval: "1h",
        },
      },
    },
  },
};
