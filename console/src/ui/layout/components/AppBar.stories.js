import { mockRouter } from "storybook-vue3-router";

import AppBarComponent from "./AppBar.vue";

export default {
  title: "Layout/AppBar",
  component: AppBarComponent,
};

const Template = {
  decorators: [
    mockRouter({
      name: "Home",
      meta: [
        "search",
        "addRuleButton",
        "createReportButton",
        "locale",
        "workbenchButtons",
        "dndSwitch",
        "advancedTitle",
        "addProject",
        "addAreaButton",
      ],
    }),
  ],
};

export const AppBar = {
  ...Template,
  args: {
    search: "search",
    locale: "string",
    addProject: true,
    advancedTitle: "title",
    addAreaButton: true,
    dndSwitch: true,
    workbenchButtons: true,
    addRuleButton: true,
    createReportButton: true,
  },
};
