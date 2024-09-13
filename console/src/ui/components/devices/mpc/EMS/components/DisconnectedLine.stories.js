import DisconnectedLineComponent from "./DisconnectedLine.vue";

export default {
  title: "Devices/MPC/EMS/systems/DisconnectedLine",
  component: DisconnectedLineComponent,
};

export const DisconnectedLine = {
  args: {
    point: {
      x: 0,
      y: 0,
    },
    size: {
      width: 200,
      height: 200,
    },
    center: {
      x: 100,
      y: 100,
    },
  },
};
