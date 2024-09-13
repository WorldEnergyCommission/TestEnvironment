import { vueRouter } from "storybook-vue3-router";

import AcceptedEventsTableComponent from "./AcceptedEventsTable.vue";

export default {
  title: "Tables/Events/AcceptedEventsTable",
  component: AcceptedEventsTableComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const AcceptedEventsTable = {
  ...Template,
  args: {
    acceptedList: [
      {
        accepted_at: new Date(),
        accepted_by: 0,
        body: "Text",
        created_at: new Date(),
      },
    ],
  },
};
