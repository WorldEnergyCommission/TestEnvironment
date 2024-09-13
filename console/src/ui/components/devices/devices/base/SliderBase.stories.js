import SliderBaseComponent from "./SliderBase.vue";

export default {
  title: "Devices/Components/Devices/Base/SliderBase",
  component: SliderBaseComponent,
};

export const SliderBase = {
  args: {
    variableData: {
      SliderBase_targetValue: "actualValue",
    },
    instance: "SliderBase",
    isActive: true,
  },
};
