import { vueRouter } from "storybook-vue3-router";

import DocumentationComponent from "./index.vue";

export default {
  title: "Views/Documentation/Documentation",
  component: DocumentationComponent,
};

const customRoutes = [
  {
    path: "/",
    name: "home",
    text: "text",
    meta: {
      locale: "Home",
    },
  },
];

const Template = {
  decorators: [vueRouter(customRoutes)],
};

export const Documentation = {
  ...Template,
  args: {},
};
