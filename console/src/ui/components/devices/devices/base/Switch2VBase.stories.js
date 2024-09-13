import Switch2VBaseComponent from "./Switch2VBase.vue";

export default {
  title: "Devices/Components/Devices/Base/Switch2VBase",
  component: Switch2VBaseComponent,
};

export const Switch2VBase = {
  args: {
    variableData: {
      Switch2VBase_onOff: "value",
      Switch2VBase_state: "state",
    },
    instance: "Switch2VBase",
    label: "Label",
    isPreview: true,
  },
};
