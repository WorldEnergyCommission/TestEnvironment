import CoreProgressLinear from "./ProgressLinear.vue";

export default {
  title: "Core/ProgressLinear",
  component: CoreProgressLinear,
};

export const ProgressLinear = {
  args: {
    color: "accent",
    height: 20,
    bgColor: "primaryBorder",
    modelValue: 20,
  },
};
