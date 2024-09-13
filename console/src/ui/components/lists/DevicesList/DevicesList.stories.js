import { vueRouter } from "storybook-vue3-router";

import DevicesListComponent from "./index.vue";

export default {
  title: "Lists/DevicesList",
  component: DevicesListComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DevicesList = {
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
    ],
  },
};
