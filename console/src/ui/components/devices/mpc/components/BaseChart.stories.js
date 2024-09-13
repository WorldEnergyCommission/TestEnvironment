import BaseChartComponent from "./BaseChart.vue";

export default {
  title: "Devices/MPC/components/BaseChart",
  component: BaseChartComponent,
};

export const BaseChart = {
  args: {
    chartType: "bar",
    chartTitle: "title",
    series: [
      {
        name: "Valve Position",
        type: "line",
        yAxis: 0,
        color: "#3450ae",
        data: [
          [1583100000000, 23],
          [1583103600000, 26],
          [1583107200000, 22],
          [1583110800000, 28],
          [1583114400000, 28],
          [1583118000000, 29],
          [1583121600000, 29],
        ],
      },
      {
        name: "Temperature",
        type: "line",
        yAxis: 1,
        color: "#50ab7e",
        data: [
          [1583100000000, 22],
          [1583103600000, 25],
          [1583107200000, 22],
          [1583110800000, 23],
          [1583114400000, 24],
          [1583118000000, 28],
          [1583121600000, 29],
        ],
      },
    ],
    yAxis: [
      {
        title: null,
        opposite: false,
        showFirstLabel: true,
        showLastLabel: true,
        endOnTick: false,
        gridLineWidth: 0,
        min: 0,
        max: 100,
        lineColor: "#3450ae",
        labels: {
          format: "{value} °C",
          style: {
            color: "#3450ae",
          },
        },
      },
      {
        title: null,
        opposite: false,
        showFirstLabel: true,
        showLastLabel: true,
        endOnTick: false,
        gridLineWidth: 0,
        min: 0,
        max: 100,
        lineColor: "#50ab7e",
        labels: {
          format: "{value}",
          style: {
            color: "#50ab7e",
          },
        },
      },
    ],
    chartWidth: 400,
    chartHeight: 400,
  },
};
