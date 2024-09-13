import { vueRouter } from "storybook-vue3-router";

import DeviceActionsComponent from "./DeviceActions.vue";

export default {
  title: "Devices/Actions/DeviceActions",
  component: DeviceActionsComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DeviceActions = {
  ...Template,
  args: {
    device: {
      id: "LightSwitch",
      name: "LightSwitch",
      type: "LightSwitch",
      collection_id: [],
      data: {
        type: "LightSwitch",
        mappings: {
          Switch_on: "lightSwitch",
          Switch_off: "lightSwitch",
          Switch_state: "lightSwitch",
        },
        meta: {
          deviceSchema: {
            additionalBasicDevices: [],
          },
        },
      },
    },
  },
};
