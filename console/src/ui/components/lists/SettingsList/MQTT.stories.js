import MQTTComponent from "./MQTT.vue";

export default {
  title: "Lists/SettingsList/MQTT",
  component: MQTTComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.eneries.com/v1/projects/projectId/mqtt-secret",
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
