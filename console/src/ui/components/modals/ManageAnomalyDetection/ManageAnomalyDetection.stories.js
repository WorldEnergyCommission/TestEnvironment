import { vueRouter } from "storybook-vue3-router";

import ManageAnomalyDetectionComponent from "./ManageAnomalyDetection.vue";

export default {
  title: "Modals/ManageAnomalyDetection/ManageAnomalyDetection",
  component: ManageAnomalyDetectionComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ManageAnomalyDetection = {
  ...Template,
  args: {
    default: "Click to see ManageAnomalyDetection dialog",
    formTitle: "Title",
    activeRoomId: "roomId",
    deviceData: {
      id: "StreamAnomalyDetection",
      name: "StreamAnomalyDetection",
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
      collection_id: "roomId",
    },
  },
};
