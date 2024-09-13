import { vueRouter } from "storybook-vue3-router";

import HistoryAnomalyDetectionComponent from "./HistoryAnomalyDetection.vue";

export default {
  title: "Devices/Components/Devices/Preview/Aiml/HistoryAnomalyDetection",
  component: HistoryAnomalyDetectionComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const HistoryAnomalyDetection = {
  ...Template,
  args: {},
};
