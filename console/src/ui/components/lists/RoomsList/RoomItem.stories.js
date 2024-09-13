import RoomItemComponent from "./RoomItem.vue";

export default {
  title: "Lists/RoomsList/RoomItem",
  component: RoomItemComponent,
};

export const RoomItem = {
  args: {
    dndActiveAndAllowed: true,
    roomData: {
      id: "room1",
      name: "Room1",
      meta: {
        cover: "4801545",
        imageId: "8c57cfe9-d40d-4bf2-8403-ec2b66cc841a",
      },
      created_at: "",
    },
  },
};
