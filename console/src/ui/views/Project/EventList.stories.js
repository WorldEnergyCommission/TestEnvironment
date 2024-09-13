import { vueRouter } from "storybook-vue3-router";

import EventListComponent from "./EventList.vue";

export default {
  title: "Views/Project/EventList",
  component: EventListComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EventList = {
  ...Template,
  args: {},
};
