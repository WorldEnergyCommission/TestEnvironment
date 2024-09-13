import TodayCardComponent from "./TodayCard.vue";

export default {
  title: "Devices/Modules/TodayCard",
  component: TodayCardComponent,
};

export const TodayCard = {
  args: {
    pv: 2,
    trees_planted: 2,
    co2_saved: 2,
    coal_saved: 2,
    grid_consumption: 2,
    grid_feed_in: 2,
    electricity_cost: 2,
    electricity_earnings: 2,
  },
};
