import { vueRouter } from "storybook-vue3-router";

import ServicesSchemaComponent from "./ServicesSchema.vue";

export default {
  title: "Modals/ManageMLModel/ServicesSchema",
  component: ServicesSchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ServicesSchema = {
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
