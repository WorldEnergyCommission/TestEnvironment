import { vueRouter } from "storybook-vue3-router";

import DefaultSchemaComponent from "./DefaultSchema.vue";

export default {
  title: "Modals/ManageAnomalyDetection/DefaultSchema",
  component: DefaultSchemaComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DefaultSchema = {
  ...Template,
  args: {
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
