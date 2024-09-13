import ManagePermissionsComponent from "./ManagePermissions.vue";

export default {
  title: "Forms/Permissions/ManagePermissions",
  component: ManagePermissionsComponent,
};

export const ManagePermissions = {
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
