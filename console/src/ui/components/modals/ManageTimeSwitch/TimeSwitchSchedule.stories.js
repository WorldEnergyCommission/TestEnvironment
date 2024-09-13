import { vueRouter } from "storybook-vue3-router";

import TimeSwitchScheduleComponent from "./TimeSwitchSchedule.vue";

export default {
  title: "Modals/ManageTimeSwitch/TimeSwitchSchedule",
  component: TimeSwitchScheduleComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TimeSwitchSchedule = {
  ...Template,
  args: {
    schedule: [
      {
        time: {
          hours: 2,
          minutes: 10,
          timezone: "Europe/Berlin",
        },
        action: 1,
        activeDays: [true, false, false, false, false, false, false],
      },
    ],
  },
};
