import { vueRouter } from "storybook-vue3-router";

import CreateProjectComponent from "./CreateProject.vue";

export default {
  title: "Modals/CreateProject",
  component: CreateProjectComponent,
};

const Template = {
  decorators: [vueRouter()],
};

export const CreateProject = {
  ...Template,
  args: {},
};
