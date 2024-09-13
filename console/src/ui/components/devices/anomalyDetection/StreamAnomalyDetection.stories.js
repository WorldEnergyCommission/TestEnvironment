import { vueRouter } from "storybook-vue3-router";

import StreamAnomalyDetectionComponent from "./StreamAnomalyDetection.vue";

export default {
  title: "Devices/Anomaly Detection/StreamAnomalyDetection",
  component: StreamAnomalyDetectionComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const StreamAnomalyDetection = {
  ...Template,
  args: {
    deviceData: {
      name: "StreamAnomalyDetection",
      type: "StreamAnomalyDetection",
      collection_id: [],
      data: {
        type: "StreamAnomalyDetection",
        chartOptions: [
          {
            calculation: {
              expression: "",
            },
            scaling: {
              max: 100,
              min: 0,
            },
            name: "Temperature",
            type: "spline",
          },
          {
            name: "AnomalyScore",
            type: "line",
            calculation: {
              expression: "",
            },
            scaling: {
              max: 100,
              min: 0,
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
