import BillingComponent from "./Billing.vue";

export default {
  title: "Views/Billing",
  component: BillingComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/invoices",
        method: "GET",
        status: 200,
        response: [
          {
            id: "Id",
            description: "Description",
            due_at: "2024-03-25T00:00:00.000+01:00",
            paid_at: "2024-03-23T00:00:00.000+01:00",
            amount: 10,
          },
        ],
      },
    ],
  },
};

export const Billing = {
  args: {},
};
