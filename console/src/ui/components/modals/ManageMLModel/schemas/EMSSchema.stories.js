import { vueRouter } from "storybook-vue3-router";

import EMSSchemaComponent from "./EMSSchema.vue";

export default {
  title: "Modals/ManageMLModel/EMSSchema",
  component: EMSSchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EMSSchema = {
  ...Template,
  args: {
    isEditModal: false,
    activeRoomId: "roomId",
    deviceData: {
      name: "EMS",
      type: "EMS",
      collection_id: "roomId",
      data: {
        type: "EMS",
        mappings: {},
        meta: {
          additionalAreas: [],
          controllerMappings: {},
        },
      },
    },
  },
};
