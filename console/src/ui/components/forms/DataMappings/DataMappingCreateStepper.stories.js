import DataMappingCreateStepperComponent from "./DataMappingCreateStepper.vue";

export default {
  title: "Forms/DataMappings/DataMappingCreateStepper",
  component: DataMappingCreateStepperComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.eneries.com/v1/data-mapping/types/list",
        method: "GET",
        status: 200,
        response: ["Item 1", "Item 2"],
      },
      {
        url: "https://api.eneries.com/v1/data-mapping/types/id/properties",
        method: "GET",
        status: 200,
        response: [
          {
            group: "group",
            id: "id",
            name: "name",
            optional: true,
            unit: "kWh",
          },
        ],
      },
    ],
  },
};

export const DataMappingCreateStepper = {
  args: {
    type: {
      id: "id",
    },
  },
};
