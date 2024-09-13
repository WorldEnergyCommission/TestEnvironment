import TotalValuesWindowComponent from "./TotalValuesWindow.vue";

export default {
  title: "Devices/Charts/TotalValuesWindow",
  component: TotalValuesWindowComponent,
};

export const TotalValuesWindow = {
  args: {
    objectsOtherSeriesStats: [
      {
        name: "Series 1",
        minValue: "0",
        maxValue: "100",
        avgValue: "50",
        unit: "kWh",
      },
    ],
    objectsDifferenceSeriesStats: [
      {
        name: "Series 1",
        sum: "100",
        unit: "kWh",
      },
    ],
  },
};
