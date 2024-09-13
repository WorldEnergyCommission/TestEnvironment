import CoreOtpInput from "./OtpInput.vue";

export default {
  title: "Core/OtpInput",
  component: CoreOtpInput,
};

export const OtpInput = {
  args: {
    label: "Label",
    lenght: "6",
    modelValue: "",
  },
};
