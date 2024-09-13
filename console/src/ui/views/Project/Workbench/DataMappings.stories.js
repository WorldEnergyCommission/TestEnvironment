import DataMappingsComponent from "./DataMappings.vue";

export default {
  title: "Views/Project/Workbench/DataMappings",
  component: DataMappingsComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/projects/projectId/data-mapping/list",
        method: "GET",
        status: 200,
        response: [
          {
            name: "DataMapping",
            type: "DataMappingId",
            type_id: "DataMappingId",
            mappings: {},
            id: "DataMappingId",
            projectId: "project1",
            created_at: "",
            complete_mappings: ["mapping"],
          },
        ],
      },
      {
        url: "https://api.efficientio.io/v1/data-mapping/types/list",
        method: "GET",
        status: 200,
        response: [
          {
            name: "DataMapping",
            id: "DataMappingId",
          },
        ],
      },
      {
        url: "https://api.efficientio.io/v1/data-mapping/types/DataMappingId/properties",
        method: "GET",
        status: 200,
        response: [
          {
            group: "group",
            id: "id",
            name: "name",
            optional: "true",
            unit: "kWh",
          },
        ],
      },
    ],
  },
};

export const DataMappings = {
  args: {},
};
