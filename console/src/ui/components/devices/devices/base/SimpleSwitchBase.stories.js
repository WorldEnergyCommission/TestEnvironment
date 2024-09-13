import SimpleSwitchBaseComponent from "./SimpleSwitchBase.vue";

export default {
  title: "Devices/Components/Devices/Base/SimpleSwitchBase",
  component: SimpleSwitchBaseComponent,
};

export const Mapped = {
  args: {
    variableData: {
      SimpleSwitchBase_onOff: "value",
    },
    instance: "SimpleSwitchBase",
    label: "Label",
    isPreview: true,
  },
};

export const NotMapped = {
  args: {
    variableData: {
      SimpleSwitchBase_onOff: "",
    },
    instance: "SimpleSwitchBase",
    label: "Hover to see tooltip",
    isPreview: true,
  },
};
