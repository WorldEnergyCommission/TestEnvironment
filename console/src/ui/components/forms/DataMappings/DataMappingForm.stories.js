import DataMappingFormComponent from "./DataMappingForm.vue";

export default {
  title: "Forms/DataMappings/DataMappingForm",
  component: DataMappingFormComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/data-mapping/types/id/properties",
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

export const DataMappingForm = {
  args: {
    type: {
      id: "id",
    },
  },
};
