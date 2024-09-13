import { vueRouter } from "storybook-vue3-router";

import ExpressionTextAreaComponent from "./ExpressionTextArea.vue";

export default {
  title: "Modals/ManageCharts/ExpressionTextArea",
  component: ExpressionTextAreaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ExpressionTextArea = {
  ...Template,
  args: {
    expressionVariable: "expressionVariable",
  },
};
