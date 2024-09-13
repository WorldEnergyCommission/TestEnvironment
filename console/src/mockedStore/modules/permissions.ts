export const permissions = {
  namespaced: true,
  state: {
    groups: ["dataMapping"],
    possiblePermisssions: [
      {
        id: "possiblePermisssions",
        name: "possiblePermisssions",
      },
    ],
  },
  getters: {
    hasPlatformPermission() {
      return () => true;
    },
    permissionsForMember() {
      return () => [
        {
          id: "permission",
          dependent_on: [],
          scope: "*",
          group: "dataMapping",
          scope_id: "scope_id",
        },
      ];
    },
    permissions() {
      return [
        {
          id: "permission1",
          dependent_on: [],
          group: "dataMapping",
        },
      ];
    },
  },
  actions: {
    fetchPermissions() {
      console.log("fetchPermissions");
      return Promise.resolve();
    },
    fetchPermissionGroups() {
      console.log("fetchPermissionGroups");
      return Promise.resolve();
    },
    fetchPossiblePermissionScopes() {
      console.log("fetchPossiblePermissionScopes");
      return Promise.resolve();
    },
    fetchPermissionsForMember() {
      console.log("fetchPermissionsForMember");
      return Promise.resolve();
    },
    createPermissionsForMember() {
      console.log("createPermissionsForMember");
      return Promise.resolve();
    },
    deletePermissionForMember() {
      console.log("deletePermissionForMember");
      return Promise.resolve();
    },
  },
};
