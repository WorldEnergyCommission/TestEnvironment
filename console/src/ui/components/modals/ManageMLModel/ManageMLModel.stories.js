import { vueRouter } from "storybook-vue3-router";

import ManageMLModelComponent from "./ManageMLModel.vue";

export default {
  title: "Modals/ManageMLModel/ManageMLModel",
  component: ManageMLModelComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ManageMLModel = {
  ...Template,
  args: {
    default: "Click to see ManageMLModel dialog",
    activeRoomId: "roomId",
    formTitle: "Title",
    deviceData: {
      name: "HeatingCircuitOptimization",
      type: "HeatingCircuitOptimization",
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
