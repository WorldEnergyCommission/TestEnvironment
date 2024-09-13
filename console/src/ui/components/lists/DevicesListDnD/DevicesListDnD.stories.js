import { vueRouter } from "storybook-vue3-router";

import DevicesListDnDComponent from "./index.vue";

export default {
  title: "Lists/DevicesListDnD",
  component: DevicesListDnDComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DevicesListDnD = {
  ...Template,
  args: {
    devicesByRoomLocal: [
      {
        id: "device1",
        name: "Device 1",
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
        favorite: true,
        collection_id: "collection1",
        created_at: new Date(),
      },
      {
        id: "device2",
        name: "Device 2",
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
        favorite: true,
        collection_id: "collection1",
        created_at: new Date(),
      },
    ],
  },
};
