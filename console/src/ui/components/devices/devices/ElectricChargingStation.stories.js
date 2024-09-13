import { vueRouter } from "storybook-vue3-router";

import ElectricChargingStationComponent from "./ElectricChargingStation.vue";

export default {
  title: "Devices/Components/Devices/ElectricChargingStation",
  component: ElectricChargingStationComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ElectricChargingStation = {
  ...Template,
  args: {
    deviceData: {
      name: "ElectricChargingStation",
      type: "ElectricChargingStation",
      collection_id: [],
      data: {
        type: "ElectricChargingStation",
        mappings: {
          Switch1_on: "state",
          Switch1_off: "state",
          Switch1_state: "state",
          Switch2_on: "state",
          Switch2_off: "state",
          Switch2_state: "state",
          Slider_targetValue: "output2",
          OutputField1_actualValue: "output1",
          OutputField2_actualValue: "output2",
          OutputField_actualValue: "output3",
          InputField_targetValue: "input",
        },
      },
    },
  },
};
