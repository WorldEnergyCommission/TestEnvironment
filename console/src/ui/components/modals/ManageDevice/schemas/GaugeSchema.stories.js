import { vueRouter } from "storybook-vue3-router";

import GaugeSchemaComponent from "./GaugeSchema.vue";

export default {
  title: "Modals/ManageDevice/GaugeSchema",
  component: GaugeSchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const GaugeSchema = {
  ...Template,
  args: {
    activeRoomId: "roomId",
    formTitle: "Title",
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
