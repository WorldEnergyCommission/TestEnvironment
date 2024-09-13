import CoreMenu from "./Menu.vue";

export default {
  title: "Core/Menu",
  component: CoreMenu,
};

export const Menu = {
  args: {
    location: "bottom",
    default: "Menu content",
    maxHeight: "300",
    persistent: true,
    activator: "Menu",
  },
};
