import { vueRouter } from "storybook-vue3-router";

import EfficientIODialogComponent from "./EfficientIODialog.vue";

export default {
  title: "Modals/EfficientIODialog",
  component: EfficientIODialogComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EfficientIODialog = {
  ...Template,
  args: {
    dialogTitle: "EfficientIODialog",
    activator: "Click to show dialog",
    content: "Dialog content",
  },
};
