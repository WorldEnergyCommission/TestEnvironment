import ModuleRoomSelectorComponent from "./ModuleRoomSelector.vue";

export default {
  title: "Forms/Modules/ModuleRoomSelector",
  component: ModuleRoomSelectorComponent,
};

export const ModuleRoomSelector = {
  args: {
    roomId: "roomId",
    moduleId: "moduleId",
  },
};
