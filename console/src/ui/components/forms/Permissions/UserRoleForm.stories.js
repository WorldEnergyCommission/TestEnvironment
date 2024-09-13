import UserRoleFormComponent from "./UserRoleForm.vue";

export default {
  title: "Forms/Permissions/UserRoleForm",
  component: UserRoleFormComponent,
};

export const UserRoleForm = {
  args: {
    user: {
      id: "userId",
      email: "email@email.com",
      first_name: "First name",
      last_name: "Last name",
      role: "admin",
      owner: true,
    },
  },
};
