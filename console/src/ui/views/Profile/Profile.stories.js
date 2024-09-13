import { mockRouter } from "storybook-vue3-router";

import ProfileComponent from "./index.vue";

export default {
  title: "Views/Profile/Profile",
  component: ProfileComponent,
};

const Template = {
  decorators: [
    mockRouter({
      meta: ["profile"],
    }),
  ],
};

export const Profile = {
  ...Template,
  args: {
    profile: {
      general: true,
      password: false,
      otp: false,
    },
  },
};
