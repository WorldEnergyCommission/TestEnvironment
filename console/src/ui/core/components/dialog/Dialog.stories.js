import CoreDialog from "./Dialog.vue";

export default {
  title: "Core/Dialog",
  component: CoreDialog,
};

export const Dialog = {
  args: {
    modelValue: false,
    maxWidth: "300",
    persistent: true,
    activator: "Dialog",
    default: "Dialog content",
  },
};
