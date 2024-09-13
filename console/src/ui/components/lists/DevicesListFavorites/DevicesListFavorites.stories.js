import { vueRouter } from "storybook-vue3-router";

import DevicesListFavoritesComponent from "./index.vue";

export default {
  title: "Lists/DevicesListFavorites",
  component: DevicesListFavoritesComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const DevicesListFavorites = {
  ...Template,
  args: {},
};
