import { vueRouter } from "storybook-vue3-router";

import DataMappingManageModalComponent from "./DataMappingManageModal.vue";

export default {
  title: "Modals/DataMapping/DataMappingManageModal",
  component: DataMappingManageModalComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/data-mapping/types/DataMappingId/properties",
        method: "GET",
        status: 200,
        response: [
          {
            group: "group",
            id: "id",
            name: "name",
            optional: "true",
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

export const DataMappingManageModal = {
  ...Template,
  args: {
    dataMapping: {
      id: "DataMappingId",
      type_id: "DataMappingId",
      name: "DataMapping",
      type: "DataMapping",
      mappings: {},
    },
  },
};
