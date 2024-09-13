import LiveCardComponent from "./LiveCard.vue";

export default {
  title: "Devices/Modules/LiveCard",
  component: LiveCardComponent,
};

export const LiveCard = {
  args: {
    pv: ["value"],
    grid: ["value"],
    battery_soc: ["value"],
  },
};
