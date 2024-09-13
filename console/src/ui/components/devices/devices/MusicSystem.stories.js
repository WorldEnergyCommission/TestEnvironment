import { vueRouter } from "storybook-vue3-router";

import MusicSystemComponent from "./MusicSystem.vue";

export default {
  title: "Devices/Components/Devices/MusicSystem",
  component: MusicSystemComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MusicSystem = {
  ...Template,
  args: {
    deviceData: {
      name: "MusicSystem",
      type: "MusicSystem",
      collection_id: [],
      data: {
        type: "MusicSystem",
        mappings: {
          Plus_commandPlus: "state",
          Minus_commandMinus: "state",
          Play_commandPlay: "state",
          Stop_commandStop: "state",
          Pause_commandPause: "state",
          Forward_commandForward: "state",
          Reverse_commandReverse: "state",
          Switch_on: "state",
          Switch_off: "state",
          Switch_state: "state",
        },
      },
    },
  },
};
