import InputFieldTextBaseComponent from "./InputFieldTextBase.vue";

export default {
  title: "Devices/Components/Devices/Base/InputFieldTextBase",
  component: InputFieldTextBaseComponent,
};

export const InputFieldTextBase = {
  args: {
    variableData: {
      InputFieldTextBase_targetValue: "actualValue",
    },
    instance: "InputFieldTextBase",
    min: 0,
    max: 100,
  },
};
