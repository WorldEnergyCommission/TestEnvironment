import { vueRouter } from "storybook-vue3-router";

import TSGLadestationNotAusComponent from "./TSGLadestationNotAus.vue";

export default {
  title: "Devices/Components/Devices/TSGLadestationNotAus",
  component: TSGLadestationNotAusComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const TSGLadestationNotAus = {
  ...Template,
  args: {
    deviceData: {
      name: "TSGLadestationNotAus",
      type: "TSGLadestationNotAus",
      collection_id: [],
      data: {
        type: "TSGLadestationNotAus",
        mappings: {
          PushButton_onOff: "state",
          PushButton_state: "state",
          DropDown1_targetValue: "state",
          DropDown2_targetValue: "state",
        },
      },
    },
  },
};
