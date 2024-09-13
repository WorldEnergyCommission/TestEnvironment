import BodyComponent from "./Body.vue";

export default {
  title: "Devices/Modules/Body",
  component: BodyComponent,
};

export const Body = {
  args: {
    data: {
      live: {
        pv: ["value"],
        grid: ["value"],
        battery_soc: ["value"],
      },
      today: {
        pv: 2,
        trees_planted: 2,
        co2_saved: 2,
        coal_saved: 2,
        grid_consumption: 2,
        grid_feed_in: 2,
        electricity_cost: 2,
        electricity_earnings: 2,
      },
      week: {
        pv: { 1583100000: 23 },
        autarchy: {
          1583100000: 1,
        },
        grid_consumption: {
          1583100000: 20,
        },
        grid_feed_in: {
          1583100000: 12,
        },
        overallAutarchy: 2,
      },
    },
  },
};
