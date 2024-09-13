import { vueRouter } from "storybook-vue3-router";

import PVSystemComponent from "./PVSystem.vue";

export default {
  title: "Devices/Components/Devices/PVSystem",
  component: PVSystemComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const PVSystem = {
  ...Template,
  args: {
    deviceData: {
      name: "PVSystem",
      type: "PVSystem",
      collection_id: [],
      data: {
        type: "PVSystem",
        mappings: {
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
