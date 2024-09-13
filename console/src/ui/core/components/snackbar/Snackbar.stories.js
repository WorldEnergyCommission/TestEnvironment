import CoreSnackbar from "./Snackbar.vue";

export default {
  title: "Core/Snackbar",
  component: CoreSnackbar,
};

export const Snackbar = {
  args: {
    default: "Snackbar content",
    modelValue: true,
    timeout: 20000000,
  },
};
