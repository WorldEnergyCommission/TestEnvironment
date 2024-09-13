import AuthLayoutComponent from "./AuthLayout.vue";

export default {
  title: "Layout/AuthLayout",
  component: AuthLayoutComponent,
};

export const AuthLayout = {
  args: {
    titleText: "Title text",
    default: "AuthLayout content",
  },
};
