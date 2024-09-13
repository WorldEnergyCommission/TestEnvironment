import { vueRouter } from "storybook-vue3-router";

import DataMappingCreateModalComponent from "./DataMappingCreateModal.vue";

export default {
  title: "Modals/DataMapping/DataMappingCreateModal",
  component: DataMappingCreateModalComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/data-mapping/types/list",
        method: "GET",
        status: 200,
        response: ["Item 1", "Item 2"],
      },
    ],
  },
};

const Template = {
  decorators: [vueRouter()],
};

export const DataMappingCreateModal = {
  ...Template,
  args: {},
};
