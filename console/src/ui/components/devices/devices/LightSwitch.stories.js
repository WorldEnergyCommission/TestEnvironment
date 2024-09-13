import { vueRouter } from "storybook-vue3-router";

import LightSwitchComponent from "./LightSwitch.vue";

export default {
  title: "Devices/Components/Devices/LightSwitch",
  component: LightSwitchComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const LightSwitch = {
  ...Template,
  args: {
    deviceData: {
      name: "LightSwitch",
      type: "LightSwitch",
      collection_id: [],
      data: {
        type: "LightSwitch",
        mappings: {
          Switch_on: "state",
          Switch_off: "state",
          Switch_state: "state",
        },
      },
    },
  },
};
