import { vueRouter } from "storybook-vue3-router";

import ReportFormComponent from "./ReportForm.vue";

export default {
  title: "Forms/Report/ReportForm",
  component: ReportFormComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ReportForm = {
  ...Template,
  args: {
    model: {
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
      meta: {
        zev: {
          innosolv: {
            username: "username",
          },
          arrayDaySettingsExternal: ["low"],
          arrayDaySettingsInternal: ["high"],
          titles: {
            photovoltaik: "photovoltaik",
            grid: "grid",
          },
          producers: {
            internal: [
              {
                name: "internal",
              },
            ],
            external: [
              {
                name: "external",
              },
            ],
          },
          consumers: [
            {
              title: "consumers title",
              name: "consumers name",
              metering_id: "consumers metering id",
            },
          ],
          tariffs: {
            internal: {
              time: [
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
              ],
              low: 1,
              high: 5,
            },
            external: {
              time: [
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
                [["0", "1"]],
              ],
              low: 20,
              high: 30,
            },
          },
        },
      },
      actions: [],
    },
  },
};
