import { vueRouter } from "storybook-vue3-router";

import ImpulseButtonComponent from "./ImpulseButton.vue";

export default {
  title: "Devices/Components/Devices/ImpulseButton",
  component: ImpulseButtonComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ImpulseButton = {
  ...Template,
  args: {
    deviceData: {
      name: "ImpulseButton",
      type: "ImpulseButton",
      collection_id: [],
      data: {
        type: "ImpulseButton",
        mappings: {
          ImpulseButton_onOff: "state",
        },
        meta: {
          cover: "4801545",
        },
      },
    },
  },
};
