import EMSArrowComponent from "./EMSArrow.vue";

export default {
  title: "Devices/MPC/EMS/systems/EMSArrow",
  component: EMSArrowComponent,
};

export const EMSArrow = {
  args: {
    point: {
      x: 0,
      y: 0,
    },
    canvasSize: {
      width: 200,
      height: 200,
    },
    center: {
      x: 100,
      y: 100,
    },
    centerColor: "blue",
    defaultPointColor: "red",
    alternativePointColor: "red",
    active: true,
    systemData: {
      pv: {
        power: "actualValue",
      },
    },
  },
};
