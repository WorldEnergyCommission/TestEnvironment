import { vueRouter } from "storybook-vue3-router";

import HCOSchemaComponent from "./HCOSchema.vue";

export default {
  title: "Modals/ManageMLModel/HCOSchema",
  component: HCOSchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const HCOSchema = {
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
