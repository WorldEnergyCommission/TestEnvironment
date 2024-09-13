import { vueRouter } from "storybook-vue3-router";

import ManageRoomComponent from "./ManageRoom.vue";

export default {
  title: "Modals/ManageRoom",
  component: ManageRoomComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ManageRoom = {
  ...Template,
  args: {
    default: "Click to show ManageRoom",
  },
};
