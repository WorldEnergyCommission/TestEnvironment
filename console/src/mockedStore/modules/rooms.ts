export const rooms = {
  namespaced: true,
  state: {
    eventListFilter: "",
  },
  getters: {
    rooms() {
      return [
        {
          id: "roomId",
          name: "room",
        },
      ];
    },
    dndLayout() {
      return [
        {
          w: 1,
          h: 1,
          i: "room1",
          room: {
            id: "room1",
            name: "Room1",
            meta: {
              cover: "4801545",
              imageId: "8c57cfe9-d40d-4bf2-8403-ec2b66cc841a",
            },
            created_at: "",
          },
          x: 0,
          y: 0,
        },
      ];
    },
  },
  actions: {
    fetchRooms() {
      console.log("fetchRooms");
      return Promise.resolve();
    },
  },
};
