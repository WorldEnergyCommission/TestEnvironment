import ScheduleTableComponent from "./ScheduleTable.vue";

export default {
  title: "Forms/Rules/ScheduleTable",
  component: ScheduleTableComponent,
};

export const ScheduleTable = {
  args: {
    schedules: [
      {
        timeFrom: {
          hours: 10,
          minutes: 30,
        },
        timeTo: {
          hours: 11,
          minutes: 30,
        },
        timezone: "Europe/Berlin",
        activeDays: [true, false, false, false, false, false, false],
      },
    ],
  },
};
