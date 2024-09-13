import { vueRouter } from "storybook-vue3-router";

import MLModelLynusChartWrapperComponent from "./MLModelLynusChartWrapper.vue";

export default {
  title: "Devices/MPC/components/MLModelLynusChartWrapper",
  component: MLModelLynusChartWrapperComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MLModelLynusChartWrapper = {
  ...Template,
  args: {
    chartData: {
      name: "",
      data: {
        mappings: {
          value_1: "actualPower",
          value_2: "calculatedPower",
        },
        options: {
          value_1: {
            agg: "avg",
            name: "Actual power",
            scaling: {
              max: 100,
              min: 0,
            },
            type: "line",
            unit: "kW",
          },
          value_2: {
            agg: "avg",
            name: "Power",
            scaling: {
              max: 100,
              min: 0,
            },
            type: "line",
            unit: "kW",
          },
        },
        selectedWidth: "full",
        type: "chart",
      },
    },
    isPreview: true,
  },
};
