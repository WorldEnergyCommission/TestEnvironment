import { vueRouter } from "storybook-vue3-router";

import FavoritesComponent from "./Favorites.vue";

export default {
  title: "Views/Project/Favorites",
  component: FavoritesComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const Favorites = {
  ...Template,
  args: {},
};
