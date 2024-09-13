import { vueRouter } from "storybook-vue3-router";

import AnomalyDetectionPreviewsListComponent from "./AnomalyDetectionPreviewsList.vue";

export default {
  title: "Devices/Components/Devices/Preview/Charts/AnomalyDetectionPreviewsList",
  component: AnomalyDetectionPreviewsListComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const AnomalyDetectionPreviewsList = {
  ...Template,
  args: {},
};
