import { vueRouter } from "storybook-vue3-router";

import ChartsViewComponent from "./ChartsView.vue";

export default {
  title: "Devices/Components/Devices/Preview/Charts/ChartsView",
  component: ChartsViewComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ChartsView = {
  ...Template,
  args: {},
};
