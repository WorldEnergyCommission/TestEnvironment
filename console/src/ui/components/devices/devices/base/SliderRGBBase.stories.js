import SliderRGBBaseComponent from "./SliderRGBBase.vue";

export default {
  title: "Devices/Components/Devices/Base/SliderRGBBase",
  component: SliderRGBBaseComponent,
};

export const SliderRGBBase = {
  args: {
    variableData: {
      SliderRGBBase_targetValue_blue: "actualValue",
      SliderRGBBase_targetValue_green: "actualValue",
      SliderRGBBase_targetValue_red: "actualValue",
    },
    instance: "SliderRGBBase",
    isActive: true,
  },
};
