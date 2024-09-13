import DropDownComponent from "./DropDown.vue";

export default {
  title: "Devices/Components/Devices/Base/DropDown",
  component: DropDownComponent,
};

export const DropDown = {
  args: {
    variableData: {
      DropDown_targetValue: "value",
    },
    instance: "DropDown",
    textMapping: {
      0: "Value 1",
      1: "Value 2",
    },
    label: "Label",
    enableSendButton: true,
  },
};
