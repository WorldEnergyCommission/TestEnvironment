import { vueRouter } from "storybook-vue3-router";

import ThermostatAnalogComponent from "./ThermostatAnalog.vue";

export default {
  title: "Devices/Components/Devices/ThermostatAnalog",
  component: ThermostatAnalogComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ThermostatAnalog = {
  ...Template,
  args: {
    deviceData: {
      name: "ThermostatAnalog",
      type: "ThermostatAnalog",
      collection_id: [],
      data: {
        type: "ThermostatAnalog",
        mappings: {
          InputField1_targetValue: "input",
          InputField2_targetValue: "input",
          InputField3_targetValue: "input",
          InputField4_targetValue: "input",
          InputField5_targetValue: "input",
          InputField6_targetValue: "input",
          Switch1_on: "state",
          Switch1_off: "state",
          Switch1_state: "state",
          Switch2_on: "state",
          Switch2_off: "state",
          Switch2_state: "state",
          Switch3_on: "state",
          Switch3_off: "state",
          Switch3_state: "state",
        },
      },
    },
  },
};
