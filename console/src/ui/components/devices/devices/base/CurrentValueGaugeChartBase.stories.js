import CurrentValueGaugeChartBaseComponent from "./CurrentValueGaugeChartBase.vue";

export default {
  title: "Devices/Components/Devices/Base/CurrentValueGaugeChartBase",
  component: CurrentValueGaugeChartBaseComponent,
};

export const CurrentValueGaugeChartBase = {
  args: {
    variableData: {
      GaugeChart_actualValue: "actualValue",
    },
    instance: "GaugeChart",
    scaling: {
      min: "0",
      max: "100",
    },
    unit: "kWh",
  },
};
