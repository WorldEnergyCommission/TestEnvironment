import ForwardBaseComponent from "./ForwardBase.vue";

export default {
  title: "Devices/Components/Devices/Base/ForwardBase",
  component: ForwardBaseComponent,
};

export const ForwardBase = {
  args: {
    variableData: {
      ForwardBase_commandForward: "value",
      ForwardBase_state: "state",
    },
    instance: "ForwardBase",
  },
};
