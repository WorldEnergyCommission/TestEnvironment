import { vueRouter } from "storybook-vue3-router";

import EditScheduleItemComponent from "./EditScheduleItem.vue";

export default {
  title: "Modals/ManageTimeSwitch/EditScheduleItem",
  component: EditScheduleItemComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EditScheduleItem = {
  ...Template,
  args: {
    item: {
      time: {
        hours: 2,
        minutes: 10,
        timezone: "Europe/Berlin",
      },
      action: 1,
      activeDays: [true, false, false, false, false, false, false],
    },
    dialog: true,
  },
};
