import { GetterTree, Module } from "vuex";

import { INavigationState } from "@/store/modules/navigation/types";
import { RootState } from "@/store/types";
import { envDocumentationTabs, envMainMenuEntries, envProjectMenuEntries } from "@/utils/env";

const state: INavigationState = {
  appNavigation: [
    {
      name: "Home",
      locale: "navigation.appNavigation.home",
      path: "/",
      icon: "home",
    },
    {
      name: "Billing",
      locale: "navigation.appNavigation.billing",
      path: "/billing",
      icon: "billing",
    },
    {
      name: "Benchmarking",
      locale: "navigation.appNavigation.benchmarking",
      path: "/benchmarking",
      icon: "fa-chart-column",
    },
    {
      name: "Documentation",
      locale: "navigation.appNavigation.documentation",
      path: "/documentation",
      icon: "documentation",
    },
    {
      name: "Ticket",
      locale: "navigation.appNavigation.ticket",
      path: "/ticket",
      icon: "ticket",
    },
    ,
    {
      name: "Playground",
      locale: "navigation.appNavigation.playground",
      path: "/playground",
      icon: "fa-baseball-bat-ball",
    },
  ],
  documentationNavigation: [
    {
      title: "User Manual",
      locale: "navigation.documentationNavigation.userManual",
      name: "UserManual",
      description: "",
      icon: "library_add",
      path: "/documentation/userManual",
    },
    {
      title: "API Documentation",
      locale: "navigation.documentationNavigation.apiDocumentation",
      name: "APIDocs",
      description: "",
      icon: "description",
      path: "/documentation/api",
    },
    {
      title: "Device Connectivity",
      locale: "navigation.documentationNavigation.deviceConnectivity",
      name: "DeviceConnectivity",
      description: "",
      icon: "description",
      path: "/documentation/deviceConnectivity",
    },
  ],
};

const getters: GetterTree<INavigationState, RootState> = {
  appNavigationFiltered(state) {
    return state.appNavigation.filter((e: any) => envMainMenuEntries.includes(e.name));
  },

  /**
   * Project navigation
   * @param state
   * @param getters
   * @param rootState
   * @param rootGetters
   */
  projectNavigation(state, getters, rootState, rootGetters) {
    const route = `/projects/${rootState.projects.projectId}`;
    return [
      {
        name: "Favorites",
        locale: "navigation.appNavigation.favorites",
        path: `${route}/favorites`,
        icon: "favourites",
        requiresOnePermissionOf: [],
      },
      {
        name: "Areas",
        locale: "navigation.appNavigation.areas",
        path: `${route}/areas`,
        pathName: "Areas",
        icon: "areas",
        requiresOnePermissionOf: [
          "createCollection",
          "readDevice",
          "writeCollection",
          "deleteCollection",
          "readAI",
          "readDataMapping",
          "writeAI",
          "readModule",
        ],
      },
      {
        name: "Devices library",
        locale: "navigation.appNavigation.devicesLibrary",
        path: `${route}/devices`,
        icon: "devices-library",
        requiresOnePermissionOf: ["createDevice"],
      },
      {
        name: "Charging",
        locale: "navigation.appNavigation.charging",
        path: `${route}/charging`,
        icon: "fa-charging-station",
        requiresOnePermissionOf: ["readDevice"],
      },
      {
        name: "AI/ML library",
        locale: "navigation.appNavigation.aimlLibrary",
        path: `${route}/aiml`,
        icon: "AI-ML",
        requiresOnePermissionOf: [],
      },
      {
        name: "Variables",
        locale: "navigation.appNavigation.variables",
        path: `${route}/variables`,
        icon: "variables",
        requiresOnePermissionOf: [],
      },
      {
        name: "Workbench",
        pathName: "Workbench-navigation",
        locale: "navigation.appNavigation.workbench",
        path: `${route}/workbench`,
        icon: "fa-screwdriver-wrench",
        requiresOnePermissionOf: [
          "createCollection",
          "readDevice",
          "writeCollection",
          "deleteCollection",
          "readAI",
          "readDataMapping",
          "writeAI",
          "readModule",
          "writeModule",
          "createModule",
        ],
      },
      {
        name: "Documents",
        locale: "navigation.appNavigation.documents",
        path: `${route}/documents`,
        icon: "repository",
        requiresOnePermissionOf: ["readDocument", "createDocument", "deleteDocument"],
      },
      {
        name: "Rules",
        locale: "navigation.appNavigation.rules",
        path: `${route}/rules`,
        icon: "fa-check",
        requiresOnePermissionOf: ["createRule", "deleteRule", "writeRule", "readRule", "writeAI"],
      },
      {
        name: "Report",
        locale: "navigation.appNavigation.report",
        path: `${route}/Report`,
        icon: "fa-file-alt",
        requiresOnePermissionOf: ["readReport", "writeReport", "deleteReport", "createReport"],
      },
      {
        name: "Event list",
        locale: "navigation.appNavigation.eventList",
        path: `${route}/eventlist`,
        icon: "eventlist",
        requiresOnePermissionOf: ["writeAlert", "listAlert"],
        accepted: rootGetters["events/getIsAllAccepted"],
        animation: rootGetters["events/getIsAllAccepted"],
      },
      {
        name: "Settings",
        locale: "navigation.appNavigation.settings",
        path: `${route}/settings`,
        icon: "settings",
        requiresOnePermissionOf: [],
      },
    ].filter((e) => envProjectMenuEntries.includes(e.name));
  },
  documentationNavigationFiltered(state) {
    return state.documentationNavigation.filter((tab: any) =>
      envDocumentationTabs.includes(tab.name),
    );
  },
};

const actions = {};

export const navigation: Module<INavigationState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
};
