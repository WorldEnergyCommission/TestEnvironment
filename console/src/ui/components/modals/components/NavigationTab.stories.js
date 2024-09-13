import { vueRouter } from "storybook-vue3-router";

import NavigationTabComponent from "./NavigationTab.vue";

export default {
  title: "Modals/Components/NavigationTab",
  component: NavigationTabComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const NavigationTab = {
  ...Template,
  args: {
    tabTitle: "Title",
    isActive: true,
  },
};
