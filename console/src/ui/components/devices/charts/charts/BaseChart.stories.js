import { vueRouter } from "storybook-vue3-router";

import BaseChartComponent from "./BaseChart.vue";

export default {
  title: "Devices/Charts/BaseChart",
  component: BaseChartComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const BaseChart = {
  ...Template,
  args: {
    chartData: {
      name: "",
      data: {
        mappings: {
          value_1: "actualPower",
          value_2: "calculatedPower",
        },
        chartOptions: [
          {
            agg: "avg",
            name: "Actual power",
            scaling: {
              max: 100,
              min: 0,
            },
            type: "line",
            unit: "kW",
          },
          {
            agg: "avg",
            name: "Power",
            scaling: {
              max: 100,
              min: 0,
            },
            type: "line",
            unit: "kW",
          },
        ],
        selectedWidth: "full",
        type: "chart",
      },
    },
    isPreview: true,
  },
};
