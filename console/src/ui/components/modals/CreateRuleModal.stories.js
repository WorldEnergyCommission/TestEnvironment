import { vueRouter } from "storybook-vue3-router";

import CreateRuleModalComponent from "./CreateRuleModal.vue";

export default {
  title: "Modals/CreateRuleModal",
  component: CreateRuleModalComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const CreateRuleModal = {
  ...Template,
  args: {},
};
