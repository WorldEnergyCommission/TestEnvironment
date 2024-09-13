import { vueRouter } from "storybook-vue3-router";

import ManageChartsNewComponent from "./ManageChartsNew.vue";

export default {
  title: "Modals/ManageChartsNew",
  component: ManageChartsNewComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ManageChartsNew = {
  ...Template,
  args: {
    default: "Click to show ManageChartsNew",
  },
};
