import { vueRouter } from "storybook-vue3-router";

import StreamAnomalyDetectionComponent from "./StreamAnomalyDetection.vue";

export default {
  title: "Devices/Components/Devices/Preview/Aiml/StreamAnomalyDetection",
  component: StreamAnomalyDetectionComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const StreamAnomalyDetection = {
  ...Template,
  args: {},
};
