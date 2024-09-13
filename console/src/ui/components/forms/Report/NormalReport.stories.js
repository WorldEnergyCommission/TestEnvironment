import NormalReportComponent from "./NormalReport.vue";

export default {
  title: "Forms/Report/NormalReport",
  component: NormalReportComponent,
};

export const NormalReport = {
  args: {
    report: {
      name: "Name",
      currency: "EUR",
      address: {
        street: "Street",
        city: "City",
        country: "Country",
      },
      variables: [
        {
          title: "Variable title",
          name: "Variable name",
          unit_cost: 20,
          unit: "EUR",
        },
      ],
    },
  },
};
