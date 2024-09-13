import SwitchBaseComponent from "./SwitchBase.vue";

export default {
  title: "Devices/Components/Devices/Base/SwitchBase",
  component: SwitchBaseComponent,
};

export const SwitchBase = {
  args: {
    variableData: {
      SwitchBase_onOff: "value",
      SwitchBase_state: "state",
    },
    instance: "SwitchBase",
    label: "Label",
    isPreview: true,
  },
};
