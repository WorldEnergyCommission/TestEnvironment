import CoreCheckbox from "./Checkbox.vue";

export default {
  title: "Core/Checkbox",
  component: CoreCheckbox,
};

export const Checkbox = {
  args: {
    label: "Label",
    color: "accent",
    modelValue: true,
  },
};
