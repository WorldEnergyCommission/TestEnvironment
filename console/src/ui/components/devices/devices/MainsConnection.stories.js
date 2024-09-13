import { vueRouter } from "storybook-vue3-router";

import MainsConnectionComponent from "./MainsConnection.vue";

export default {
  title: "Devices/Components/Devices/MainsConnection",
  component: MainsConnectionComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const MainsConnection = {
  ...Template,
  args: {
    deviceData: {
      name: "MainsConnection",
      type: "MainsConnection",
      collection_id: [],
      data: {
        type: "MainsConnection",
        mappings: {
          OutputField_actualValue: "output1",
        },
      },
    },
  },
};
