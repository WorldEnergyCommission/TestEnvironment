import { vueRouter } from "storybook-vue3-router";

import AreaChartComponent from "./AreaChart.vue";

export default {
  title: "Devices/Components/Devices/Preview/Charts/AreaChart",
  component: AreaChartComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const AreaChart = {
  ...Template,
  args: {
    chartData: {
      data: {
        chartOptions: [
          {
            agg: "diff",
            name: "Series 1",
            scaling: {
              max: "5",
              min: "0",
            },
            seriesType: "View",
            type: "area",
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
