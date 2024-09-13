import { vueRouter } from "storybook-vue3-router";

import CreateReportModalComponent from "./CreateReportModal.vue";

export default {
  title: "Modals/CreateReportModal",
  component: CreateReportModalComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const CreateReportModal = {
  ...Template,
  args: {},
};
