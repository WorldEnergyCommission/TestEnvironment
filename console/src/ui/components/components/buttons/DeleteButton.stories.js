import { action } from "@storybook/addon-actions";

import DeleteButtonComponent from "./DeleteButton.vue";

export default {
  title: "Components/DeleteButton",
  component: DeleteButtonComponent,
};

export const DeleteButton = {
  args: {
    onClick: action("on-click"),
  },
};
