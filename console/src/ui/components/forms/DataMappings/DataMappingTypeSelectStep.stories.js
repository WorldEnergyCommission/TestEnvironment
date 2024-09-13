import DataMappingTypeSelectStepComponent from "./DataMappingTypeSelectStep.vue";

export default {
  title: "Forms/DataMappings/DataMappingTypeSelectStep",
  component: DataMappingTypeSelectStepComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/data-mapping/types/list",
        method: "GET",
        status: 200,
        response: ["Item 1", "Item 2"],
      },
    ],
  },
};

export const DataMappingTypeSelectStep = {
  args: {},
};
