import PushButtonBaseComponent from "./index.vue";

export default {
  title: "Devices/Components/Devices/Base/Push Button Types/PushButtonBase",
  component: PushButtonBaseComponent,
};

export const PushButtonBase = {
  args: {
    variableData: {
      Switch_onOff: "on",
      Switch_state: "state",
    },
    instance: "Switch",
    buttonText: "Button text",
  },
};
