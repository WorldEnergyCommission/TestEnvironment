import PlayBaseComponent from "./PlayBase.vue";

export default {
  title: "Devices/Components/Devices/Base/PlayBase",
  component: PlayBaseComponent,
};

export const PlayBase = {
  args: {
    variableData: {
      PlayBase_commandPlay: "value",
      PlayBase_state: "state",
    },
    instance: "PlayBase",
  },
};
