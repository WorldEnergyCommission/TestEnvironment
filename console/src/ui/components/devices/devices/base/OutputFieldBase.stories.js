import OutputFieldBaseComponent from "./OutputFieldBase.vue";

export default {
  title: "Devices/Components/Devices/Base/OutputFieldBase",
  component: OutputFieldBaseComponent,
};

export const OutputFieldBase = {
  args: {
    variableData: {
      OutputFieldBase_actualValue: "actualValue",
    },
    instance: "OutputFieldBase",
    min: 0,
    max: 100,
  },
};
