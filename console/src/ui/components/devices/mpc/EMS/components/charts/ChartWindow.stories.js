import { vueRouter } from "storybook-vue3-router";

import ChartWindowComponent from "./ChartWindow.vue";

export default {
  title: "Devices/MPC/EMS/ChartWindow",
  component: ChartWindowComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ChartWindow = {
  ...Template,
  args: {
    items: [
      {
        title: "ChartProdCons",
        view: "ChartProdCons",
      },
      {
        title: "ChartDifference",
        view: "ChartDifference",
      },
    ],
  },
};
