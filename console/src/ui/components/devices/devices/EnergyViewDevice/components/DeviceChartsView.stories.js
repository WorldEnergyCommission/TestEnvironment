import { vueRouter } from "storybook-vue3-router";

import DeviceChartsViewComponent from "./DeviceChartsView.vue";

export default {
  title: "Devices/Components/Devices/Energy View Device/DeviceChartsView",
  component: DeviceChartsViewComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DeviceChartsView = {
  ...Template,
  args: {
    isPreview: true,
    mappingsList: {
      battery: true,
      electricHeating: true,
      evChargingStation: true,
      generator: true,
      grid: true,
      heatMeter: true,
      heatProducer: true,
      heatingPump: true,
      houseConsumption: true,
      otherBigConsumer: true,
      pvSystem: true,
    },
    systemsMappings: {
      battery: ["battery"],
      electricHeating: ["electricHeating"],
      evChargingStation: ["evChargingStation"],
      generator: ["generator"],
      grid: ["grid"],
      heatMeter: ["heatMeter"],
      heatProducer: ["heatProducer"],
      heatingPump: ["heatingPump"],
      houseConsumption: ["houseConsumption"],
      otherBigConsumer: ["otherBigConsumer"],
      pvSystem: ["pvSystem"],
    },
    socMapping: {
      battery: [],
      electricHeating: [],
      evChargingStation: [],
      generator: [],
      grid: [],
      heatMeter: [],
      heatProducer: [],
      heatingPump: [],
      houseConsumption: [],
      otherBigConsumer: [],
      pvSystem: [],
    },
  },
};
