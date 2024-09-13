import { vueRouter } from "storybook-vue3-router";

import TimeSwitchComponent from "./TimeSwitch.vue";

export default {
  title: "Devices/Components/Devices/TimeSwitch",
  component: TimeSwitchComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TimeSwitch = {
  ...Template,
  args: {
    deviceData: {
      name: "TimeSwitch",
      type: "TimeSwitch",
      collection_id: [],
      data: {
        type: "TimeSwitch",
        mappings: {
          TimeSwitch_on: "state",
          TimeSwitch_off: "state",
          TimeSwitch_state: "state",
          TimeSwitchControls_onOff: "state",
        },
      },
    },
  },
};
