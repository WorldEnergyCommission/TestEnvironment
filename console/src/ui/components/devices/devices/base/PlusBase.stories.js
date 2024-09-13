import PlusBaseComponent from "./PlusBase.vue";

export default {
  title: "Devices/Components/Devices/Base/PlusBase",
  component: PlusBaseComponent,
};

export const Default = {
  args: {
    variableData: {
      PlusBase_commandPlus: "value",
      PlusBase_state: "state",
    },
    instance: "PlusBase",
  },
};

export const IsPushButtonBehavior = {
  args: {
    variableData: {
      PlusBase_commandPlus: "value",
      PlusBase_state: "state",
    },
    instance: "PlusBase",
    isPushButtonBehavior: true,
  },
};
