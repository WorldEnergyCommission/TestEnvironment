export const members = {
  namespaced: true,
  state: {
    currentMember: {
      admin: true,
      first_name: "First name",
      last_name: "Last name",
      email: "Email",
      role: "Role",
    },
  },
  getters: {
    members() {
      return [
        {
          id: 0,
          admin: true,
          first_name: "First name 1",
          last_name: "Last name 1",
          email: "email@email.com",
          role: "role",
        },
        {
          id: 1,
          admin: false,
          first_name: "First name 2",
          last_name: "Last name 2",
          email: "email2@email.com",
          role: "role",
        },
        {
          id: 2,
          admin: false,
          first_name: "First name 3",
          last_name: "Last name 3",
          email: "email3@email.com",
          role: "role",
        },
      ];
    },
    hasPermission() {
      return () => true;
    },
    hasScopedPermission() {
      return (permission: string, scope: string) => true;
    },
  },
  actions: {
    deleteMember() {
      console.log("deleteMember");
      return Promise.resolve();
    },
    fetchMembers() {
      console.log("fetchMembers");
      return Promise.resolve();
    },
    updateMember() {
      console.log("updateMember");
      return Promise.resolve();
    },
  },
};
