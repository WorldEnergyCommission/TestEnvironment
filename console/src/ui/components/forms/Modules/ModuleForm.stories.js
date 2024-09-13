import ModuleFormComponent from "./ModuleForm.vue";

export default {
  title: "Forms/Modules/ModuleForm",
  component: ModuleFormComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/modules/types/id/properties",
        method: "GET",
        status: 200,
        response: [
          {
            id: "1",
            max_count: 1,
            optional: true,
            device_type_id: "type",
            name: "Item 1",
          },
          {
            id: "2",
            max_count: 1,
            optional: false,
            device_type_id: "type",
            name: "Item 2",
          },
        ],
      },
    ],
  },
};

export const ModuleForm = {
  args: {
    type: {
      id: "id",
    },
  },
};
