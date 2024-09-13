import { vueRouter } from "storybook-vue3-router";

import MeasurementsComponent from "./Measurements.vue";

export default {
  title: "Views/Project/Measurements",
  component: MeasurementsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Measurements = {
  ...Template,
  args: {},
};
