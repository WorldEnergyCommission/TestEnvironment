export const measurements = {
  namespaced: true,
  state: {
    measurements: new Map<string, string | number>([
      ["state", "value"],
      ["input", 0],

      ["actualValue", 50],
      ["output1", 2.3],
      ["output2", 6.11],
      ["output3", 4.9],
      ["output4", 9.7],
      ["date", 1709276400],
    ]),
    measurementsKeys: [],
    measurement: {},
  },
  getters: {
    measurementsKeys() {
      return ["key1"];
    },
    measurements() {
      return {
        variable: "value",
      };
    },
    measurement() {
      return () => {};
    },
  },
  mutations: {
    setMeasurementsFilter(name: string) {
      console.log("setMeasurementsFilter", name);
    },
  },
  actions: {
    fetchMeasurements() {
      console.log("fetchMeasurements");
      return Promise.resolve();
    },
    updateChartOptionsWithoutMessage() {
      console.log("updateChartOptionsWithoutMessage");
      return Promise.resolve();
    },
    publishMeasurement() {
      console.log("publishMeasurement");
      return Promise.resolve();
    },
  },
};
