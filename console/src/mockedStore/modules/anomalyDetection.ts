import anomalyDetectionTypes from "@/store/modules/anomalyDetection/anomalyDetectionTypes";

export const anomalyDetection = {
  namespaced: true,
  state: {
    anomalyDetectionTypes: anomalyDetectionTypes,
  },
  getters: {
    anomalyDetectionTypesWithLocaleNamesList() {
      return [];
    },
    anomalyDetectionDevices() {
      return [
        {
          id: "anomalyDetectionDeviceId",
          name: "Anomaly detection",
          data: {
            type: "HistoryAnomalyDetection",
            chartOptions: [
              {
                calculation: {
                  expression: "",
                },
                name: "Temperature",
                type: "spline",
                scaling: {
                  min: 0,
                  max: 100,
                },
              },
              {
                calculation: {
                  expression: "",
                },
                name: "AnomalyScore",
                type: "line",
                scaling: {
                  min: 0,
                  max: 100,
                },
              },
            ],
            meta: {
              controllerMappings: {
                anomalyScore: [],
              },
            },
          },
          collection_id: "roomId",
        },
      ];
    },
  },
};
