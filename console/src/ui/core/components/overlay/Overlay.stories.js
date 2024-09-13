import CoreOverlay from "./Overlay.vue";

export default {
  title: "Core/Overlay",
  component: CoreOverlay,
};

export const Overlay = {
  args: {
    default: "Overlay content",
    modelValue: true,
  },
};
