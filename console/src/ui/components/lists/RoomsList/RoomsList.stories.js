import { vueRouter } from "storybook-vue3-router";

import RoomsListComponent from "./index.vue";

export default {
  title: "Lists/RoomsList/RoomsList",
  component: RoomsListComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const RoomsList = {
  ...Template,
  args: {},
};
