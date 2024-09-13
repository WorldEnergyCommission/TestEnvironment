import MQTTComponent from "./MQTT.vue";

export default {
  title: "Lists/SettingsList/MQTT",
  component: MQTTComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/projects/projectId/mqtt-secret",
        method: "GET",
        status: 200,
        response: "secret",
      },
    ],
  },
};

export const MQTT = {
  args: {},
};
