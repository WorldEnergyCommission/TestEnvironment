import { vueRouter } from "storybook-vue3-router";

import CreateModuleComponent from "./CreateModule.vue";

export default {
  title: "Modals/Modules/CreateModule",
  component: CreateModuleComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/modules/types/list",
        method: "GET",
        status: 200,
        response: ["Item 1", "Item 2"],
      },
    ],
  },
};

const Template = {
  decorators: [vueRouter()],
};

export const CreateModule = {
  ...Template,
  args: {},
};
