import { vueRouter } from "storybook-vue3-router";

import ManageDeviceComponent from "./ManageDevice.vue";

export default {
  title: "Modals/ManageDevice/ManageDevice",
  component: ManageDeviceComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ManageDevice = {
  ...Template,
  args: {
    default: "Click to see ManageDevice dialog",
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
