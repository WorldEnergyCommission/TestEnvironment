import ModulesComponent from "./Modules.vue";

export default {
  title: "Views/Project/Workbench/Modules",
  component: ModulesComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.eneries.io/v1/projects/projectId/modules/list",
        method: "GET",
        status: 200,
        response: [
          {
            name: "Module",
            type: "ModuleId",
            type_id: "ModuleId",
            collection_id: "roomId",
            id: "ModuleId",
            projectId: "project1",
            created_at: "",
            properties: [
              {
                data_mapping_id: "id",
                data_mapping_name: "name",
              },
            ],
          },
        ],
      },
      {
        url: "https://api.eneries.io/v1/modules/types/list",
        method: "GET",
        status: 200,
        response: [
          {
            name: "Module",
            id: "ModuleId",
          },
        ],
      },
      {
        url: "https://api.eneries.io/v1/modules/types/ModuleId/properties",
        method: "GET",
        status: 200,
        response: [
          {
            name: "name",
            id: "id",
            device_type_id: "device_type",
            optional: true,
            max_count: 2,
          },
        ],
      },
    ],
  },
};

export const Modules = {
  args: {},
};
