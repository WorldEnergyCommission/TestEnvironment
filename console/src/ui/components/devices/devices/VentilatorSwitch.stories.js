import { vueRouter } from "storybook-vue3-router";

import VentilatorSwitchComponent from "./VentilatorSwitch.vue";

export default {
  title: "Devices/Components/Devices/VentilatorSwitch",
  component: VentilatorSwitchComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const VentilatorSwitch = {
  ...Template,
  args: {
    deviceData: {
      name: "VentilatorSwitch",
      type: "VentilatorSwitch",
      collection_id: [],
      data: {
        type: "VentilatorSwitch",
        mappings: {
          Switch_on: "state",
          Switch_off: "state",
          Switch_state: "state",
        },
      },
    },
  },
};
