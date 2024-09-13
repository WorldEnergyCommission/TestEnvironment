import { vueRouter } from "storybook-vue3-router";

import CalculationAggregationWindowComponent from "./CalculationAggregationWindow.vue";

export default {
  title: "Modals/ManageCharts/CalculationAggregationWindow",
  component: CalculationAggregationWindowComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const CalculationAggregationWindow = {
  ...Template,
  args: {
    calculationVariables: ["variable"],
    aggregationOptions: ["avg"],
    availableAggregationMethods: [
      {
        state: "avg",
        abbr: "avg",
      },
    ],
  },
};
