import { vueRouter } from "storybook-vue3-router";

import EMSComponent from "./EMS.vue";

export default {
  title: "Devices/MPC/EMS/systems/EMS",
  component: EMSComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EMS = {
  ...Template,
  args: {
    isPreview: true,
    deviceData: {
      name: "EMS",
      id: "EMS",
      type: "EMS",
      data: {
        type: "EMS",
        mappings: {},
      },
    },
  },
};
