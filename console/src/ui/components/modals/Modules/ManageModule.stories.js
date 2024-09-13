import { vueRouter } from "storybook-vue3-router";

import ManageModuleComponent from "./ManageModule.vue";

export default {
  title: "Modals/Modules/ManageModule",
  component: ManageModuleComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.eneries.com/v1/modules/types/DeviceId/properties",
        method: "GET",
        status: 200,
        response: [
          {
            group: "group",
            id: "id",
            name: "name",
            optional: true,
            unit: "kWh",
          },
        ],
      },
    ],
  },
};

const Template = {
  decorators: [vueRouter()],
};

export const ManageModule = {
  ...Template,
  args: {
    device: {
      name: "Device",
      type: "Device",
      type_id: "DeviceId",
      id: "DeviceId",
      created_at: "2024-03-26T00:00:00Z",
      project_id: "projectId",
      collection_id: "roomId",
      properties: [
        {
          data_mapping_id: "property",
          data_mapping_name: "property",
        },
      ],
    },
  },
};
