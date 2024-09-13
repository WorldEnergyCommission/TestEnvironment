import { vueRouter } from "storybook-vue3-router";

import DefaultDeviceLayoutComponent from "./DefaultDeviceLayout.vue";

export default {
  title: "Devices/Layout/DefaultDeviceLayout",
  component: DefaultDeviceLayoutComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DefaultDeviceLayout = {
  ...Template,
  args: {
    deviceData: {
      name: "LightSwitch",
      type: "LightSwitch",
      collection_id: [],
      data: {
        type: "LightSwitch",
      },
    },
    "basic-controls": "LightSwitch",
    isPreview: false,
  },
};
