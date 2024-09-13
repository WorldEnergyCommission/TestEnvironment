import { defineAsyncComponent } from "vue";
import { createRouter, createWebHashHistory, createWebHistory, RouteRecordRaw } from "vue-router";

import { store } from "@/store";
import CircleSpinner from "@/ui/components/components/CenteredCircleSpinner.vue";
import { Auth } from "@/utils/Auth";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/:pathMatch(.*)*",
    name: "404 - Page not found",
    component: () => import("@/ui/views/404.vue"),
  },

  {
    path: "/login",
    name: "Login",
    component: () => import("@/ui/views/Login.vue"),
    meta: {
      auth: true,
    },
  },
  {
    path: "/reset-credentials",
    name: "ResetPassword",
    component: () => import("@/ui/views/ResetPassword.vue"),
    meta: {
      auth: true,
    },
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/ui/views/Register.vue"),
    meta: {
      auth: true,
    },
  },
  {
    path: "/",
    name: "Home",
    component: () => import("@/ui/views/Home.vue"),
    meta: {
      appNavigation: true,
      searchByProjects: true,
      addProject: true,
      navigation: "appNavigation",
      locale: "navigation.appNavigation.home",
    },
  },
  {
    path: "/benchmarking",
    name: "Benchmarking",
    component: () => import("@/ui/views/Benchmarking.vue"),
    meta: {
      appNavigation: true,
      navigation: "appNavigation",
      locale: "navigation.appNavigation.benchmarking",
    },
  },
  {
    path: "/playground",
    name: "Playground",
    component: () => import("@/ui/views/Playground.vue"),
    meta: {
      appNavigation: true,
      navigation: "appNavigation",
      locale: "navigation.appNavigation.playground",
    },
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("@/ui/views/Profile/index.vue"),
    children: [
      {
        path: "",
        name: "General",
        component: () => import("@/ui/views/Profile/General.vue"),
        meta: {
          navigation: "appNavigation",
          locale: "navigation.appNavigation.profile",
          profile: {
            general: true,
          },
        },
      },
      {
        path: "password",
        name: "Password",
        component: () => import("@/ui/views/Profile/Password.vue"),
        meta: {
          navigation: "appNavigation",
          locale: "navigation.appNavigation.profile",
          profile: {
            password: true,
          },
        },
      },
      {
        path: "otp",
        name: "Authenticator",
        component: () => import("@/ui/views/Profile/Authenticator.vue"),
        meta: {
          navigation: "appNavigation",
          locale: "navigation.appNavigation.profile",
          profile: {
            otp: true,
          },
        },
      },
    ],
  },
  {
    path: "/projects/:id",
    component: () => import("@/ui/views/Project/index.vue"),
    children: [
      {
        path: "workbench",
        name: "Workbench",

        component: () => import("@/ui/views/Project/Workbench/index.vue"),
        meta: {
          search: true,
          searchByDevices: true,
          navigation: "projectNavigation",
          locale: "navigation.appNavigation.workbench",
        },
        children: [
          {
            path: "",
            name: "Workbench-navigation",
            component: () => import("@/ui/views/Project/Workbench/Navigation.vue"),
          },
          {
            path: "data-mappings",
            name: "workbench-data-mappings",
            component: () => import("@/ui/views/Project/Workbench/DataMappings.vue"),
            meta: {
              navigation: "projectNavigation",
              locale: "navigation.appNavigation.workbench",
              breadcrumb: "workbench.modules.dataMappings.title",
            },
          },
          {
            path: "modules",
            name: "workbench-modules",
            component: () => import("@/ui/views/Project/Workbench/Modules.vue"),
            meta: {
              navigation: "projectNavigation",
              locale: "navigation.appNavigation.workbench",
              breadcrumb: "workbench.modules.modules.title",
            },
          },
          {
            path: "devices",
            name: "workbench-devices",
            component: () => import("@/ui/views/Project/Workbench/Devices.vue"),
            meta: {
              search: true,
              searchByDevices: true,
              workbenchButtons: true,
              navigation: "projectNavigation",
              locale: "navigation.appNavigation.workbench",
              breadcrumb: "workbench.legacy.devices.title",
              workbenchCurrentTab: 0,
            },
          },
          {
            path: "charts",
            name: "workbench-charts",
            component: () => import("@/ui/views/Project/Workbench/Charts.vue"),
            meta: {
              navigation: "projectNavigation",
              locale: "navigation.appNavigation.workbench",
              breadcrumb: "workbench.legacy.charts.title",
              workbenchButtons: true,
              workbenchCurrentTab: 2,
            },
          },
          {
            path: "anomaly-detection",
            name: "workbench-anomaly-detection",
            component: () => import("@/ui/views/Project/Workbench/AnomalyDetection.vue"),
            meta: {
              navigation: "projectNavigation",
              locale: "navigation.appNavigation.workbench",
              breadcrumb: "workbench.legacy.anomaly.title",
              workbenchButtons: true,
              workbenchCurrentTab: 1,
            },
          },
          {
            path: "models",
            name: "workbench-models",
            component: () => import("@/ui/views/Project/Workbench/MLModels.vue"),
            meta: {
              navigation: "projectNavigation",
              locale: "navigation.appNavigation.workbench",
              breadcrumb: "workbench.legacy.ml.title",
              workbenchButtons: true,
              workbenchCurrentTab: 3,
            },
          },
          {
            path: "devices-library",
            name: "workbench-devices-library",
            component: () => import("@/ui/views/Project/Workbench/DevicesLibrary.vue"),
            meta: {
              navigation: "projectNavigation",
              locale: "navigation.appNavigation.devicesLibrary",
              breadcrumb: "workbench.library.devices.title",
            },
          },
          {
            path: "aiml-library",
            name: "workbench-aiml-library",
            component: () => import("@/ui/views/Project/Workbench/AIML.vue"),
            meta: {
              navigation: "projectNavigation",
              locale: "navigation.appNavigation.aimlLibrary",
              breadcrumb: "workbench.library.ml.title",
            },
          },
        ],
      },
      {
        path: "favorites",
        name: "Favorites",
        component: () => import("@/ui/views/Project/Favorites.vue"),
        meta: {
          dndSwitch: true,
          search: true,
          searchByDevices: true,
          mqtt: true,
          navigation: "projectNavigation",
          locale: "navigation.appNavigation.favorites",
        },
      },
      {
        path: "variables",
        name: "Measurements",
        component: () => import("@/ui/views/Project/Measurements.vue"),
        meta: {
          search: true,
          searchByMeasurements: true,
          advancedTitle: true,
          mqtt: true,
          navigation: "projectNavigation",
          locale: "navigation.appNavigation.variables",
        },
      },
      {
        path: "charging",
        name: "Charging",
        component: () => import("@/ui/views/Project/Charging.vue"),
        meta: {
          mqtt: true,
          navigation: "projectNavigation",
          locale: "navigation.appNavigation.charging",
        },
      },
      {
        path: "areas/:activeroom?",
        name: "Areas",
        component: () => import("@/ui/views/Project/Rooms.vue"),
        meta: {
          dndSwitch: true,
          search: true,
          searchByDevices: true,
          addAreaButton: true,
          toggleAreasViewButton: true,
          mqtt: true,
          navigation: "projectNavigation",
          locale: "navigation.appNavigation.areas",
        },
      },
      {
        path: "settings",
        name: "Settings",
        component: () => import("@/ui/views/Project/Settings.vue"),
        meta: {
          navigation: "projectNavigation",
          locale: "navigation.appNavigation.settings",
          search: true,
          searchByMeasurements: true,
        },
      },
      {
        path: "eventlist",
        name: "Event List",
        component: () => import("@/ui/views/Project/EventList.vue"),
        meta: {
          search: true,
          searchByEventList: true,
          navigation: "projectNavigation",
          locale: "navigation.appNavigation.eventList",
        },
      },
      {
        path: "rules",
        name: "Rules",
        component: () => import("@/ui/views/Project/Rules.vue"),
        meta: {
          navigation: "projectNavigation",
          addRuleButton: true,
          search: true,
          searchByRules: true,
          locale: "navigation.appNavigation.rules",
        },
      },
      {
        path: "report",
        name: "Report",
        component: () => import("@/ui/views/Project/Report.vue"),
        meta: {
          navigation: "projectNavigation",
          createReportButton: true,
          locale: "navigation.appNavigation.report",
        },
      },
      {
        path: "documents",
        name: "Documents",
        component: () => import("@/ui/views/Project/Documents.vue"),
        meta: {
          navigation: "projectNavigation",
          locale: "navigation.appNavigation.documents",
          addDocumentButton: true,
        },
      },
    ],
  },
  {
    path: "/billing",
    name: "Billing",
    component: () => import("@/ui/views/Billing.vue"),
    meta: {
      appNavigation: true,
      navigation: "appNavigation",
      locale: "navigation.appNavigation.billing",
    },
  },
  {
    path: "/ticket",
    name: "Ticket",
    component: () => import("@/ui/views/Ticket.vue"),
    meta: {
      appNavigation: true,
      navigation: "appNavigation",
      locale: "navigation.appNavigation.ticket",
    },
  },
  {
    path: "/documentation",
    name: "Documentation",
    component: () => import("@/ui/views/Documentation/index.vue"),
    meta: {
      appNavigation: true,
      navigation: "appNavigation",
      locale: "navigation.appNavigation.documentation",
    },
    children: [
      {
        path: "userManual",
        name: "User Manual",
        meta: {
          title: "User Manual",
          appNavigation: true,
          documentationView: true,
          navigation: "appNavigation",
          locale: "navigation.documentationNavigation.userManual",
        },
        component: () => import("@/ui/views/Documentation/UserManual/index.vue"),
      },
      {
        path: "api",
        name: "API",
        meta: {
          title: "API",
          appNavigation: true,
          documentationView: true,
          navigation: "appNavigation",
          locale: "navigation.documentationNavigation.apiDocumentation",
        },
        component: () => import("@/ui/views/Documentation/APIDocs.vue"),
      },
      {
        path: "deviceConnectivity",
        name: "DeviceConnectivity",
        component: () => import("@/ui/views/Documentation/DeviceConnectivity/index.vue"),
        meta: {
          title: "Device Connectivity",
          appNavigation: true,
          documentationView: true,
          navigation: "appNavigation",
          locale: "navigation.documentationNavigation.deviceConnectivity",
        },
        children: [
          {
            path: "edgeDevice",
            name: "Documentation Modbus TCP Edge Device with Beckhoff PL",
            component: () => import("@/ui/views/Documentation/DeviceConnectivity/EdgeDevice.vue"),
            meta: {
              title: "Edge Device",
              appNavigation: true,
              documentationView: true,
              navigation: "appNavigation",
              locale: "navigation.deviceConnectivityRoutes.modbusTCPEdgeDevice",
            },
          },
        ],
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (!Auth.didInitialize) {
    next();
    return;
  }

  if (
    to.name !== "Login" &&
    to.name !== "ResetPassword" &&
    to.name !== "Register" &&
    !store.state.app.auth.accessToken
  ) {
    next({
      path: "/login",
      replace: true,
    });
    return;
  }

  if (
    (to.name === "Login" || to.name === "ResetPassword" || to.name === "Register") &&
    store.state.app.auth.accessToken
  ) {
    next({
      name: "Home",
      replace: true,
    });
    return;
  }

  if (to.name === "Register") {
    const allowed = await Auth.registrationAllowed();
    if (!allowed && !to.query.invite) {
      next({
        path: "/login",
        replace: true,
      });
    }
  }

  next();
});
