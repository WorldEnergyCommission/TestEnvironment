import { vueRouter } from "storybook-vue3-router";

import OpenEventsTableComponent from "./OpenEventsTable.vue";

export default {
  title: "Tables/Events/OpenEventsTable",
  component: OpenEventsTableComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const OpenEventsTable = {
  ...Template,
  args: {
    needtoAccept: [
      {
        accepted_at: "",
        accepted_by: "",
        body: "Text",
        created_at: new Date(),
      },
    ],
  },
};
