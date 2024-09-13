import StopBaseComponent from "./StopBase.vue";

export default {
  title: "Devices/Components/Devices/Base/StopBase",
  component: StopBaseComponent,
};

export const StopBase = {
  args: {
    variableData: {
      StopBase_commandStop: "value",
      StopBase_state: "state",
    },
    instance: "StopBase",
  },
};
