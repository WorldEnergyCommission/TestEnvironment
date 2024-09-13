import { vueRouter } from "storybook-vue3-router";

import KineticPowerSchemaComponent from "./KineticPowerSchema.vue";

export default {
  title: "Modals/ManageDevice/KineticPowerSchema",
  component: KineticPowerSchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const KineticPowerSchema = {
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
