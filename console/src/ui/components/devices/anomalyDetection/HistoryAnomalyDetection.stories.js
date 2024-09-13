import { vueRouter } from "storybook-vue3-router";

import HistoryAnomalyDetectionComponent from "./HistoryAnomalyDetection.vue";

export default {
  title: "Devices/Anomaly Detection/HistoryAnomalyDetection",
  component: HistoryAnomalyDetectionComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const HistoryAnomalyDetection = {
  ...Template,
  args: {
    deviceData: {
      name: "HistoryAnomalyDetection",
      type: "HistoryAnomalyDetection",
      collection_id: [],
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
    },
    isPreview: true,
  },
};
