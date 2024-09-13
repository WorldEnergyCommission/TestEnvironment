import PauseBaseComponent from "./PauseBase.vue";

export default {
  title: "Devices/Components/Devices/Base/PauseBase",
  component: PauseBaseComponent,
};

export const PauseBase = {
  args: {
    variableData: {
      PauseBase_commandPause: "value",
      PauseBase_state: "state",
    },
    instance: "PauseBase",
  },
};
