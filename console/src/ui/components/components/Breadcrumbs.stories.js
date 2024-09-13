import { vueRouter } from "storybook-vue3-router";

import BreadcrumbsComponent from "./Breadcrumbs.vue";

export default {
  title: "Components/Breadcrumbs",
  component: BreadcrumbsComponent,
};

const customRoutes = [
  {
    path: "/",
    name: "home",
    component: BreadcrumbsComponent,
    meta: {
      locale: "Home",
    },
  },
];

const Template = {
  decorators: [vueRouter(customRoutes)],
};

export const Breadcrumbs = {
  ...Template,
  args: {},
};
