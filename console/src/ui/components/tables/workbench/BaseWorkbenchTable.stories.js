import { vueRouter } from "storybook-vue3-router";

import BaseWorkbenchTableComponent from "./BaseWorkbenchTable.vue";

export default {
  title: "Tables/Workbench/BaseWorkbenchTable",
  component: BaseWorkbenchTableComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const BaseWorkbenchTable = {
  ...Template,
  args: {
    items: [
      {
        name: "Item",
        data: {
          type: "Item",
        },
        collection_id: "roomId",
      },
    ],
    actions: "Actions",
  },
};
