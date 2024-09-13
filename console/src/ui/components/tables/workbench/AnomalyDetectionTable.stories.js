import { vueRouter } from "storybook-vue3-router";

import AnomalyDetectionTableComponent from "./AnomalyDetectionTable.vue";

export default {
  title: "Tables/Workbench/AnomalyDetectionTable",
  component: AnomalyDetectionTableComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const AnomalyDetectionTable = {
  ...Template,
  args: {},
};
