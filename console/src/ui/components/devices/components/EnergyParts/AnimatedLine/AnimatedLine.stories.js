import AnimatedLineComponent from "./index.vue";

export default {
  title: "Devices/Components/Energy Parts/AnimatedLine",
  component: AnimatedLineComponent,
};

export const AnimatedLine = {
  args: {
    size: {
      height: 200,
      width: 200,
    },
    point: {
      x: 200,
      y: 0,
    },
    center: {
      x: 100,
      y: 100,
    },
    fromPointToCenter: true,
    lineWidth: 6,
  },
};
