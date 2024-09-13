import ModuleLayoutComponent from "./ModuleLayout.vue";

export default {
  title: "Devices/Layout/ModuleLayout",
  component: ModuleLayoutComponent,
};

export const ModuleLayout = {
  args: {
    moduleData: {
      name: "Energy View",
      type: "EnergyView",
      data: {
        mappings: {
          battery: "battery",
          electricHeating: "electricHeating",
          evChargingStation: "evChargingStation",
          generator: "generator",
          grid: "grid",
          heatMeter: "heatMeter",
          heatProducer: "heatProducer",
          heatingPump: "heatingPump",
          houseConsumption: "houseConsumption",
          otherBigConsumer: "otherBigConsumer",
          pvSystem: "pvSystem",
        },
        meta: {
          titleMappings: {
            battery: "battery",
            electricHeating: "electricHeating",
            evChargingStation: "evChargingStation",
            generator: "generator",
            grid: "grid",
            heatMeter: "heatMeter",
            heatProducer: "heatProducer",
            heatingPump: "heatingPump",
            houseConsumption: "houseConsumption",
            otherBigConsumer: "otherBigConsumer",
            pvSystem: "pvSystem",
          },
          intervals: {
            battery: "1h",
            electricHeating: "1h",
            evChargingStation: "1h",
            generator: "1h",
            grid: "1h",
            heatMeter: "1h",
            heatProducer: "1h",
            heatingPump: "1h",
            houseConsumption: "1h",
            otherBigConsumer: "1h",
            pvSystem: "1h",
          },
        },
      },
    },
  },
};
