export const events = {
  namespaced: true,
  state: {
    eventListFilter: "",
  },
  getters: {},
  actions: {
    loadEvents() {
      console.log("loadEvents");
      return Promise.resolve({
        data: [
          {
            accepted_at: "2024-03-25T00:00:00.000+01:00",
            created_at: "2024-03-23T00:00:00.000+01:00",
            accepted_by: 1,
            body: "Text",
          },
          {
            accepted_at: "",
            created_at: "2024-03-23T00:00:00.000+01:00",
            accepted_by: "",
            body: "Text",
          },
        ],
        pages: 1,
      });
    },
  },
  mutations: {
    acceptEvent() {
      console.log("acceptEvent");
    },
    acceptAllEvents() {
      console.log("acceptAllEvents");
    },
  },
};
