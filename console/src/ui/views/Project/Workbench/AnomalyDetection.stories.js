import { vueRouter } from "storybook-vue3-router";

import AnomalyDetectionComponent from "./AnomalyDetection.vue";

export default {
  title: "Views/Project/Workbench/AnomalyDetection",
  component: AnomalyDetectionComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const AnomalyDetection = {
  ...Template,
  args: {},
};
