import CoreSlider from "./Slider.vue";

export default {
  title: "Core/Slider",
  component: CoreSlider,
};

export const Slider = {
  args: {
    max: 100,
    min: 0,
    step: 10,
    modelValue: 20,
  },
};
