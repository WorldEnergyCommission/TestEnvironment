import { vueRouter } from "storybook-vue3-router";

import PricesTableComponent from "./PricesTable.vue";

export default {
  title: "Tables/PricesTable",
  component: PricesTableComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/invoices",
        method: "GET",
        status: 200,
        response: [
          {
            due_at: 1711527819523,
            paid_at: 1711527819523,
            description: "Description",
            id: "id",
            amount: 20,
          },
        ],
      },
    ],
  },
};

const Template = {
  decorators: [vueRouter()],
};

export const PricesTable = {
  ...Template,
  args: {},
};
