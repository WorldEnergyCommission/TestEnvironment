import { vueRouter } from "storybook-vue3-router";

import ColumnChartDifferenceComponent from "./ColumnChartDifference.vue";

export default {
  title: "Devices/Components/Devices/Preview/Charts/ColumnChartDifference",
  component: ColumnChartDifferenceComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ColumnChartDifference = {
  ...Template,
  args: {
    chartData: {
      data: {
        chartOptions: [
          {
            agg: "first",
            name: "Series 1",
            scaling: {
              max: "25",
              min: "0",
            },
            seriesType: "View",
            type: "column",
            unit: "",
            var: "",
          },
          {
            agg: "first",
            name: "Series 2",
            scaling: {
              max: "20",
              min: "0",
            },
            seriesType: "View",
            type: "column",
            unit: "",
            var: "",
          },
        ],
        selectedStackingOptions: undefined,
        selectedWidth: "half",
        type: "chart",
      },
      created_at: "2021-10-07T07:43:33.554983Z",
    },
  },
};
