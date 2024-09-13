import OutputFieldBaseComponent from "./OutputFieldBase.vue";

export default {
  title: "Devices/MPC/base/OutputFieldBase",
  component: OutputFieldBaseComponent,
};

export const OutputFieldBase = {
  args: {
    actualValueState: 2,
    min: 0,
    max: 10,
  },
};
