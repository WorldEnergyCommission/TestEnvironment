import { vueRouter } from "storybook-vue3-router";

import DropDownSchemaComponent from "./DropDownSchema.vue";

export default {
  title: "Modals/ManageDevice/DropDownSchema",
  component: DropDownSchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DropDownSchema = {
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
