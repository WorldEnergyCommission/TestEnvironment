import { vueRouter } from "storybook-vue3-router";

import ThermostatDigitalComponent from "./ThermostatDigital.vue";

export default {
  title: "Devices/Components/Devices/ThermostatDigital",
  component: ThermostatDigitalComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const ThermostatDigital = {
  ...Template,
  args: {
    deviceData: {
      name: "ThermostatDigital",
      type: "ThermostatDigital",
      collection_id: [],
      data: {
        type: "ThermostatDigital",
        mappings: {
          Plus_commandPlus: "state",
          Minus_commandMinus: "state",
          Switch1_on: "state",
          Switch1_off: "state",
          Switch1_state: "state",
          Switch2_on: "state",
          Switch2_off: "state",
          Switch2_state: "state",
          Switch3_on: "state",
          Switch3_off: "state",
          Switch3_state: "state",
          OutputField_actualValue: "output1",
          InputField1_targetValue: "input",
          InputField2_targetValue: "input",
          InputField3_targetValue: "input",
          InputField4_targetValue: "input",
        },
      },
    },
  },
};
