import { vueRouter } from "storybook-vue3-router";

import FinalStepActionsComponent from "./FinalStepActions.vue";

export default {
  title: "Modals/Components/Actions/FinalStepActions",
  component: FinalStepActionsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const FinalStepActions = {
  ...Template,
  args: {
    nextButtonToolTip: "Tooltip",
  },
};
