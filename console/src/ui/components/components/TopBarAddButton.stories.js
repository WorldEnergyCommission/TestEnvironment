import { action } from "@storybook/addon-actions";

import TopBarAddButtonComponent from "./TopBarAddButton.vue";

export default {
  title: "Components/TopBarAddButton",
  component: TopBarAddButtonComponent,
};

export const TopBarAddButton = {
  args: {
    text: "Button",
    onClick: action("click"),
  },
};
