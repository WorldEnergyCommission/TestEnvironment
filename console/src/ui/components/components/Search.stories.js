import { mockRouter } from "storybook-vue3-router";

import SearchComponent from "./Search.vue";

export default {
  title: "Components/Search",
  component: SearchComponent,
};

const Template = {
  decorators: [
    mockRouter({
      meta: [
        "searchByProjects",
        "searchByDevices",
        "searchByMeasurements",
        "searchByEventList",
        "searchByRules",
      ],
    }),
  ],
};

export const Search = {
  ...Template,
  args: {
    searchByProjects: true,
    searchByDevices: false,
    searchByMeasurements: false,
    searchByEventList: false,
    searchByRules: false,
  },
};
