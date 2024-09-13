import { vueRouter } from "storybook-vue3-router";

import TVComponent from "./TV.vue";

export default {
  title: "Devices/Components/Devices/TV",
  component: TVComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TV = {
  ...Template,
  args: {
    deviceData: {
      name: "TV",
      type: "TV",
      collection_id: [],
      data: {
        type: "TV",
        mappings: {
          Plus_commandPlus: "state",
          Minus_commandMinus: "state",
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
