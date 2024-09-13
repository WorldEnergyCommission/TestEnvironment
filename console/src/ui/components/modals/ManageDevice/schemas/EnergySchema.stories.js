import { vueRouter } from "storybook-vue3-router";

import EnergySchemaComponent from "./EnergySchema.vue";

export default {
  title: "Modals/ManageDevice/EnergySchema",
  component: EnergySchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EnergySchema = {
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
