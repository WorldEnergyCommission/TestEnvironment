import { vueRouter } from "storybook-vue3-router";

import DefaultSchemaComponent from "./DefaultSchema.vue";

export default {
  title: "Modals/ManageMLModel/DefaultSchema",
  component: DefaultSchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DefaultSchema = {
  ...Template,
  args: {
    isEditModal: true,
    activeRoomId: "roomId",
    deviceData: {
      name: "HeatingCircuitOptimization",
      type: "HeatingCircuitOptimization",
      collection_id: "roomId",
      data: {
        type: "HeatingCircuitOptimization",
        mappings: {},
        meta: {
          additionalAreas: [],
          controllerMappings: {},
          timing: {
            high_set_temperature: 10,
          },
        },
      },
    },
  },
};
