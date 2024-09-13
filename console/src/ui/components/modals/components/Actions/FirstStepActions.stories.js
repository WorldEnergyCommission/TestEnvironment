import { vueRouter } from "storybook-vue3-router";

import FirstStepActionsComponent from "./FirstStepActions.vue";

export default {
  title: "Modals/Components/Actions/FirstStepActions",
  component: FirstStepActionsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const FirstStepActions = {
  ...Template,
  args: {
    nextButtonToolTip: "Tooltip",
  },
};
