import { vueRouter } from "storybook-vue3-router";

import ChartWindowEnergyViewComponent from "./ChartWindowEnergyView.vue";

export default {
  title: "Devices/Components/Devices/Energy View Device/ChartWindowEnergyView",
  component: ChartWindowEnergyViewComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ChartWindowEnergyView = {
  ...Template,
  args: {
    variableData: {
      battery_actualValue: "battery",
    },
    instance: "battery",
    metaData: {},
    isPreview: true,
  },
};
