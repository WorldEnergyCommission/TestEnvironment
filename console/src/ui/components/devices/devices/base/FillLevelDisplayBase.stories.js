import FillLevelDisplayBaseComponent from "./FillLevelDisplayBase.vue";

export default {
  title: "Devices/Components/Devices/Base/FillLevelDisplayBase",
  component: FillLevelDisplayBaseComponent,
};

export const FillLevelDisplayBase = {
  args: {
    variableData: {
      FillLevelDisplayBase_actualValue: "actualValue",
    },
    instance: "FillLevelDisplayBase",
    min: 0,
    max: 100,
    isText: true,
  },
};
