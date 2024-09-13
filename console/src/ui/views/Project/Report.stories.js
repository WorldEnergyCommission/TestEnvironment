import { vueRouter } from "storybook-vue3-router";

import ReportComponent from "./Report.vue";

export default {
  title: "Views/Project/Report",
  component: ReportComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Report = {
  ...Template,
  args: {},
};
