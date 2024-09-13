export const charts = {
  namespaced: true,
  state: {
    chartsTypes: {
      chart: {
        mappings: ["value"],
      },
      LineChart: {
        mappings: ["value"],
      },
      ColumnChart: {
        mappings: ["value"],
      },
      AreaChart: {
        mappings: ["value"],
      },
      GaugeChart: {
        mappings: ["value"],
      },
    },
  },
  getters: {
    charts() {
      return [
        {
          name: "LineChart",
          collection_id: "roomId",
          data: {
            chartOptions: [
              {
                agg: "diff",
                name: "Series 1",
                scaling: {
                  max: "35",
                  min: "10",
                },
                seriesType: "View",
                type: "line",
                unit: "",
                var: "",
              },
              {
                agg: "last",
                name: "Series 2",
                scaling: {
                  max: "30",
                  min: "10",
                },
                seriesType: "View",
                type: "line",
                unit: "",
                var: "",
              },
            ],
            type: "LineChart",
          },
        },
      ];
    },
  },
  actions: {
    fetchChartAgg() {
      console.log("fetchChartAgg");
      return Promise.resolve([[2, 2]]);
    },
  },
};
