export const report = {
  namespaced: true,
  state: {
    reportList: [
      {
        type: "normal",
        name: "normal",
        active: true,
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
        actions: [
          {
            format: "",
            type: "email",
            params: {
              recipients: [],
              subject: "",
              body: "",
            },
          },
        ],
        meta: {
          show_report_image: true,
        },
      },
      {
        type: "zev",
        name: "zev",
        active: false,
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
        actions: [],
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
      },
    ],
  },
  getters: {},
  actions: {
    fetchReports() {
      console.log("fetchReports");
      return Promise.resolve();
    },
    addReport() {
      console.log("addReport");
      return Promise.resolve();
    },
    modifyReport() {
      console.log("modifyReport");
      return Promise.resolve();
    },
    deleteReport() {
      console.log("deleteReport");
      return Promise.resolve();
    },
    loadReports() {
      console.log("loadReports");
      return Promise.resolve();
    },
  },
};
