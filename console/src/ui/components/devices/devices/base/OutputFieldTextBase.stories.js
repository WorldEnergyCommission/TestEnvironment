import OutputFieldTextBaseComponent from "./OutputFieldTextBase.vue";

export default {
  title: "Devices/Components/Devices/Base/OutputFieldTextBase",
  component: OutputFieldTextBaseComponent,
};

export const OutputFieldTextBase = {
  args: {
    variableData: {
      OutputFieldTextBase_actualValue: "state",
    },
    instance: "OutputFieldTextBase",
    min: 0,
    max: 100,
  },
};
