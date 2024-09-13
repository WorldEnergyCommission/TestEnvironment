import { vueRouter } from "storybook-vue3-router";

import DefaultSchemaComponent from "./DefaultSchema.vue";

export default {
  title: "Modals/ManageDevice/DefaultSchema",
  component: DefaultSchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DefaultSchema = {
  ...Template,
  args: {
    deviceData: {
      name: "LightSwitch",
      type: "LightSwitch",
      collection_id: "roomId",
      data: {
        type: "LightSwitch",
        mappings: {},
      },
    },
  },
};
