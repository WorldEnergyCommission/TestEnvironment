import { vueRouter } from "storybook-vue3-router";

import RoomsComponent from "./Rooms.vue";

export default {
  title: "Views/Project/Rooms",
  component: RoomsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Rooms = {
  ...Template,
  args: {},
};
