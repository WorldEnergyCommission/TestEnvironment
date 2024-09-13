import { vueRouter } from "storybook-vue3-router";

import SecondStepActionsComponent from "./SecondStepActions.vue";

export default {
  title: "Modals/Components/Actions/SecondStepActions",
  component: SecondStepActionsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const SecondStepActions = {
  ...Template,
  args: {
    nextButtonToolTip: "Tooltip",
  },
};
