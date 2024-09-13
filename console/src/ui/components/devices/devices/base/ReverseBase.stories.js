import ReverseBaseComponent from "./ReverseBase.vue";

export default {
  title: "Devices/Components/Devices/Base/ReverseBase",
  component: ReverseBaseComponent,
};

export const ReverseBase = {
  args: {
    variableData: {
      ReverseBase_commandReverse: "value",
      ReverseBase_state: "state",
    },
    instance: "ReverseBase",
  },
};
