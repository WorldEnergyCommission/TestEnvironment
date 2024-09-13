import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import { IAppState, IAuth, IUser } from "./types";
import { IPermission } from "../permissions/types";
import api from "@/store/api";
import { RootState } from "@/store/types";

const state: IAppState = {
  user: {
    email: "",
    first_name: "",
    last_name: "",
    id: "",
  },
  weatherData: null,
  weatherForecastData: null,
  reportBox: {
    message: "",
    type: "",
    value: false,
  },
  workbenchCurrentTab: 0,
  shouldForward: true,
  auth: {
    accessToken: "",
    refreshToken: "",
    expiresAt: new Date(-8640000000000000),
    refreshExpiresAt: new Date(-8640000000000000),
  },
};

const getters: GetterTree<IAppState, RootState> = {
  getReportMessageAndType(state) {
    return state.reportBox;
  },
  getUser(state) {
    return state.user;
  },
  getShouldForward(state) {
    return state.shouldForward;
  },
  isSearchActive(state, getter, rootstate, rootGetters) {
    const projectSearch = rootstate.projects.projectsFilter;
    const devicesSearch = rootstate.devices.devicesFilter;
    const measurementsSearch = rootstate.measurements.measurementsFilter;
    const eventListSearch = rootstate.events.eventListFilter;
    const rulesSearch = rootstate.rules.rulesFilter;
    return (
      (projectSearch && projectSearch !== "") ||
      (devicesSearch && devicesSearch !== "") ||
      (measurementsSearch && measurementsSearch !== "") ||
      (eventListSearch && eventListSearch !== "") ||
      (rulesSearch && rulesSearch !== "")
    );
  },
  isLoggedIn(state) {
    if (!state.auth.accessToken) return false;
    return state.auth.accessToken !== "";
  },
};

const mutations: MutationTree<IAppState> = {
  setReport(state, payload) {
    state.reportBox = { ...state.reportBox, ...payload };
  },
  setWeatherData(state, payload) {
    state.weatherData = payload;
  },
  setUser(state, user: IUser) {
    state.user = user;
  },
  setWorkbenchTab(state, payload) {
    state.workbenchCurrentTab = payload;
  },
  setShouldForward(state, payload) {
    state.shouldForward = payload;
  },
  setAuth(state, auth: IAuth) {
    state.auth = auth;
  },
  setWeatherForecastData(state, payload) {
    state.weatherForecastData = payload;
  },
};

const actions: ActionTree<IAppState, RootState> = {
  /**
   * Load weather data
   * @param commit
   * @param location location data. Example: { display_name: name, lat: lat, lon: lon }
   */
  async fetchWeather({ commit }, location) {
    if (!location || !Object.values(location).length) {
      commit("setWeatherData", null);
      return;
    }
    const { lat, lon } = location;
    await api.fetch(`/weather?lat=${lat}&lon=${lon}`, "GET").then((res) => {
      commit("setWeatherData", res);
    });
  },

  /**
   * Load weather data
   * @param commit
   * @param location location data. Example: { display_name: name, lat: lat, lon: lon }
   */
  async fetchWeatherForecast({ commit }, location) {
    if (!location || !Object.values(location).length) {
      commit("setWeatherForecastData", null);
      return;
    }
    const { lat, lon } = location;
    await api.fetch(`/weather/forecast?lat=${lat}&lon=${lon}`, "GET").then((res) => {
      commit("setWeatherForecastData", res);
    });
  },

  /**
   * Clear store when leave project
   * @param state
   * @param rootState
   */
  async clear({ state, rootState }) {
    rootState.projects.projectId = null;
    rootState.projects.project = {};
    rootState.projects.mqttInfo = {};
    rootState.projects.lastHeartbeatMessage = 0;
    rootState.measurements.measurements = Map();
    rootState.devices.devices = Map();
    rootState.rooms.rooms = Map();
    state.weatherData = null;
    rootState.mpc.mpcControllers = Map();
    rootState.members.currentMember = null;
    rootState.rules.rules = Map();
    rootState.events.eventList = [];
    rootState.members.members = Map();
  },

  /**
   * Remove selected file
   * @param commit
   * @param rootState
   * @param {string} fileId file id
   */
  async deleteFile({ commit, rootState }, fileId) {
    await api.fetch(`/projects/${rootState.projects.projectId}/documents/${fileId}`, "DELETE");
    commit("setReport", {
      type: "success",
      message: "File has been deleted",
      value: true,
    });
  },
};

export const app: Module<IAppState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
