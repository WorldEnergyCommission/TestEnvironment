export const dataMappings = {
  namespaced: true,
  state: {},
  getters: {
    filteredByType() {
      return () => [
        {
          id: "id",
          type: "type",
          type_id: "typeId",
          name: "name",
          mappings: {},
          created_at: "",
          project_id: "",
          complete_mappings: [],
        },
      ];
    },
  },
  actions: {
    fetchDataMappings() {
      console.log("fetchDataMappings");
      return Promise.resolve();
    },
  },
};
