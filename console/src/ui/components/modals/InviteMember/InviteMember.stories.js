import { vueRouter } from "storybook-vue3-router";

import InviteMemberComponent from "./index.vue";

export default {
  title: "Modals/InviteMember/InviteMember",
  component: InviteMemberComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const InviteMember = {
  ...Template,
  args: {},
};
