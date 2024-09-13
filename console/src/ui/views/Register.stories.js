import { mockRouter } from "storybook-vue3-router";

import RegisterComponent from "./Register.vue";

export default {
  title: "Views/Register",
  component: RegisterComponent,
  parameters: {
    mockData: [
      {
        url: "https://api.efficientio.io/v1/users/userId",
        method: "GET",
        status: 200,
        response: {
          inviter: "Inviter",
          project_name: "Project name",
          used_at: "",
          email: "email@email.com",
        },
      },
    ],
  },
};

const Template = {
  decorators: [
    mockRouter({
      meta: ["query"],
    }),
  ],
};

export const Register = {
  ...Template,
  args: {
    query: {
      invite: "invite",
    },
  },
};
