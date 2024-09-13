import AddPermissionFormComponent from "./AddPermissionForm.vue";

export default {
  title: "Forms/Permissions/AddPermissionForm",
  component: AddPermissionFormComponent,
};

export const AddPermissionForm = {
  args: {
    user: {
      id: "userId",
    },
  },
};
