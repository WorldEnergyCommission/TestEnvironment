import { vueRouter } from "storybook-vue3-router";

import ManageChartsCalculationComponent from "./ManageChartsCalculation.vue";

export default {
  title: "Modals/ManageCharts/ManageChartsCalculation",
  component: ManageChartsCalculationComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ManageChartsCalculation = {
  ...Template,
  args: {
    index: 0,
    name: "Name",
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
      calculation: {
        expression: "expression",
        aggregations: {
          state: "avg",
          abbr: "avg",
        },
      },
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
