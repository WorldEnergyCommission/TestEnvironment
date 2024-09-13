import { vueRouter } from "storybook-vue3-router";

import EnergyInputRowComponent from "./EnergyInputRow.vue";

export default {
  title: "Modals/ManageDevice/EnergyInputRow",
  component: EnergyInputRowComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const EnergyInputRow = {
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
