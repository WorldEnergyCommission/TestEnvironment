import { vueRouter } from "storybook-vue3-router";

import ChartOptionsComponent from "./ChartOptions.vue";

export default {
  title: "Modals/ManageCharts/ChartOptions",
  component: ChartOptionsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ChartOptions = {
  ...Template,
  args: {
    index: 0,
    name: "name",
    itemOptions: {
      scaling: {
        max: 10,
        min: 5,
      },
      name: "Name",
      var: "actualValue",
      unit: "kWh",
      miss: "miss",
      agg: {
        state: "avg",
        abbr: "avg",
      },
      type: "type",
    },
    aggregationMethods: [
      {
        state: "avg",
        abbr: "avg",
      },
    ],
    missingValueStrategies: [
      {
        state: "miss",
        abbr: "miss",
      },
    ],
    chartTypes: [
      {
        text: "type",
        value: "type",
      },
    ],
  },
};
