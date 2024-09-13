import { vueRouter } from "storybook-vue3-router";

import LightPushButtonComponent from "./LightPushButton.vue";

export default {
  title: "Devices/Components/Devices/LightPushButton",
  component: LightPushButtonComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const LightPushButton = {
  ...Template,
  args: {
    deviceData: {
      name: "LightPushButton",
      type: "LightPushButton",
      collection_id: [],
      data: {
        type: "LightPushButton",
        mappings: {
          PushButton_onOff: "state",
          PushButton_state: "state",
        },
      },
    },
  },
};
