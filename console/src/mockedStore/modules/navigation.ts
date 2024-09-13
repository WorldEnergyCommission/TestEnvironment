export const navigation = {
  namespaced: true,
  state: {},
  getters: {
    documentationNavigationFiltered() {
      return [
        {
          path: "/",
          locale: "navigation.documentationNavigation.userManual",
        },
      ];
    },
    appNavigationFiltered() {
      return [
        {
          name: "App navigation",
          locale: "App navigation",
          icon: "home",
          path: "/",
        },
      ];
    },
    projectNavigation() {
      return [
        {
          name: "Project navigation",
          locale: "Project navigation",
          icon: "home",
          path: "/",
          requiresOnePermissionOf: [],
        },
      ];
    },
  },
};
