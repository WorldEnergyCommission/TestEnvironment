import { vueRouter } from "storybook-vue3-router";

import SocketSwitchComponent from "./SocketSwitch.vue";

export default {
  title: "Devices/Components/Devices/SocketSwitch",
  component: SocketSwitchComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const SocketSwitch = {
  ...Template,
  args: {
    deviceData: {
      name: "SocketSwitch",
      type: "SocketSwitch",
      collection_id: [],
      data: {
        type: "SocketSwitch",
        mappings: {
          Switch_on: "state",
          Switch_off: "state",
          Switch_state: "state",
        },
      },
    },
  },
};
