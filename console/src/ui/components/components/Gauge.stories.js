import GaugeComponent from "./Gauge.vue";

export default {
  title: "Components/Gauge",
  component: GaugeComponent,
};

export const Gauge = {
  args: {
    options: {
      arcLabels: ["25%", "50%", "75%"],
      needleValue: 45,
      needleColor: "black",
      needleStartValue: 0,
      hasNeedle: true,
      rangeLabel: ["0", "100"],
      arcDelimiters: [25, 50, 75],
      chartWidth: null,
      arcColors: ["#E83B3A", "#E83B3A", "#FF9800", "#30BF54"],
    },
  },
};
