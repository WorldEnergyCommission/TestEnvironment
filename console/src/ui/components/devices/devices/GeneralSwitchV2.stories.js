import { vueRouter } from "storybook-vue3-router";

import GeneralSwitchV2Component from "./GeneralSwitchV2.vue";

export default {
  title: "Devices/Components/Devices/GeneralSwitchV2",
  component: GeneralSwitchV2Component,
};

const Template = {
  decorators: [vueRouter()],
};

export const GeneralSwitchV2 = {
  ...Template,
  args: {
    deviceData: {
      name: "GeneralSwitchV2",
      type: "GeneralSwitchV2",
      collection_id: [],
      data: {
        type: "GeneralSwitchV2",
        mappings: {
          Switch2V_onOff: "state",
          Switch2V_state: "state",
        },
      },
    },
  },
};
