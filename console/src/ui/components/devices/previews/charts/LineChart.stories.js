import { vueRouter } from "storybook-vue3-router";

import LineChartComponent from "./LineChart.vue";

export default {
  title: "Devices/Components/Devices/Preview/Charts/LineChart",
  component: LineChartComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const LineChart = {
  ...Template,
  args: {
    chartData: {
      data: {
        chartOptions: [
          {
            agg: "diff",
            name: "Series 1",
            scaling: {
              max: "35",
              min: "10",
            },
            seriesType: "View",
            type: "line",
            unit: "",
            var: "",
          },
          {
            agg: "last",
            name: "Series 2",
            scaling: {
              max: "30",
              min: "10",
            },
            seriesType: "View",
            type: "line",
            unit: "",
            var: "",
          },
        ],
        selectedStackingOptions: "normal",
        selectedWidth: "half",
        type: "chart",
      },
      created_at: "2021-10-07T07:43:33.554983Z",
    },
  },
};
