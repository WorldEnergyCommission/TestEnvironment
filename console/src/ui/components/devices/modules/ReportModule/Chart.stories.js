import ChartComponent from "./Chart.vue";

export default {
  title: "Devices/Modules/Chart",
  component: ChartComponent,
};

export const Chart = {
  args: {
    titles: ["Series 1", "Series 2"],
    types: ["bar"],
    data: [
      {
        1710486000: 10,
        1710399600: 2,
        1710313200: 4,
        1710226800: 20,
      },
      {
        1710486000: 12,
        1710399600: 12,
        1710313200: 6,
        1710226800: 13,
      },
    ],
    yAxisis: ["1"],
    units: ["kWh"],
  },
};
