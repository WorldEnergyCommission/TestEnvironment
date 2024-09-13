import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import devicesSettings from "./settings";
import api from "@/store/api";
import { IDevice, IDevicesState } from "@/store/modules/devices/types";
import { ModuleType } from "@/store/modules/modules/types";
import { IMLModel } from "@/store/modules/mpc/types";
import { RootState } from "@/store/types";
import { i18nInstance } from "@/ui/plugins/i18n";

const state: IDevicesState = {
  devices: Map(),
  devicesFilter: "",
  ...devicesSettings,
};

const getters: GetterTree<IDevicesState, RootState> = {
  /**
   * all devices: devices and charts
   * when we fetch use "/projects/project_id/devices" in request url in response will be devices and charts
   * @param state list of devices, list of devices types, deviceFilter
   */
  allDevices(state: IDevicesState) {
    return state.devices.valueSeq().toJS();
  },
  /**
   * Only devices, filtered from charts
   * @param state
   * @param getters
   */
  devices(state: IDevicesState, getters: any) {
    return getters.allDevices.filter((device: any) =>
      Object.keys(state.devicesTypesFiltered).includes(device.data.type),
    );
  },
  devicesTypes(state: IDevicesState) {
    return state.devicesTypesFiltered;
  },
  deviceTypeSchemaByKey:
    (state: IDevicesState) => (type: keyof typeof devicesSettings.devicesTypes) =>
      state.devicesTypesFiltered[type],

  /**
   * Goes through devicesTypesFiltered and create options
   * (Example: { value: key, title: i18n translation }) for every item
   * @param state
   */
  devicesTypesWithLocaleNamesList(state: IDevicesState) {
    return Object.keys(state.devicesTypesFiltered).map((itemType: string) => ({
      value: itemType,
      title: i18nInstance.t(`devices.${itemType}.previewName`),
    }));
  },

  /**
   * Return devices, MPC, charts attached to selected room
   * @param state
   * @param getters
   * @param rootState
   * @param rootGetters
   */
  devicesByRoom:
    (state, getters, rootState, rootGetters) =>
    (roomId: string): (IDevice | IMLModel | ModuleType)[] => {
      const mpc = rootGetters["mpc/mpcControllers"];
      const charts = rootGetters["charts/charts"];
      const modules = rootGetters["modules/listWithMappings"];
      const { devices } = getters;
      return [...devices, ...charts, ...mpc, ...modules].filter(
        (device: any) => device.collection_id === roomId,
      );
    },

  /**
   * Returns devices, MPC, charts which are favorites, prop favorites = true
   * @param state
   * @param getters
   * @param rootState
   * @param rootGetters
   */
  favoritesDevices(state, getters, rootState, rootGetters) {
    const mpc = rootGetters["mpc/mpcControllers"];
    const charts = rootGetters["charts/charts"];
    const { devices } = getters;
    return [...devices, ...charts, ...mpc].filter((device) => device.favorite);
  },

  /**
   * Returns devices list with the visibility status of the settings window
   * @param state
   */
  devicesIsSettings(state: IDevicesState) {
    return Object.entries(state.devicesTypes).map((device: any) => [
      device[0],
      device[1].isSettingsView,
    ]);
  },
};

const mutations: MutationTree<IDevicesState> = {
  setDevices(state: IDevicesState, devices: Map<string, IDevice>) {
    state.devices = devices;
  },
  setDevicesFilter(state: IDevicesState, name: string) {
    state.devicesFilter = name;
  },
};

const actions: ActionTree<IDevicesState, RootState> = {
  /**
   * Load devices list, creates Map collection from them and set to devices state
   * @param commit
   * @param state
   * @param rootState
   */
  async fetchDevices({ commit, state, rootState }) {
    const res = await api.fetch(`/projects/${rootState.projects.projectId}/devices`, "GET");
    const devices = (res as IDevice[]).reduce(
      (acc, cur) => acc.set(cur.id, cur),
      Map<string, IDevice>(),
    );
    commit("setDevices", devices);
  },

  /**
   * Creates device
   * @param commit
   * @param state
   * @param rootState
   * @param device
   */
  async createDevice({ commit, state, rootState }, device: IDevice) {
    const res = await api.fetch(
      `/projects/${rootState.projects.projectId}/devices`,
      "POST",
      device,
    );
    commit("setDevices", state.devices.set(res.id, res));
    commit(
      "app/setReport",
      {
        type: "success",
        message: i18nInstance.t("uiComponents.reportMessages.createDevice", { name: res.name }),
        value: true,
      },
      { root: true },
    );
  },

  /**
   * Removes selected device, rules attached to device
   * @param commit
   * @param dispatch
   * @param state
   * @param rootState
   * @param device device data
   */
  async deleteDevice({ commit, dispatch, state, rootState }, device: IDevice) {
    const project_id = rootState.projects.projectId;
    const warningRuleId = device.data?.meta?.warningRule;
    const errorRuleId = device.data?.meta?.errorRule;
    // remove rules attached to device
    await Promise.all(
      [warningRuleId, errorRuleId]
        .filter((rule_id: string) => rule_id)
        .map((rule_id: string) => {
          return dispatch("rules/deleteRule", { project_id, rule_id }, { root: true });
        }),
    );

    await api.fetch(`/projects/${rootState.projects.projectId}/devices/${device.id}`, "DELETE");
    commit("setDevices", state.devices.remove(device.id));
    commit(
      "app/setReport",
      {
        type: "success",
        message: i18nInstance.t("uiComponents.reportMessages.deleteDevice"),
        value: true,
      },
      { root: true },
    );
  },

  /**
   * Updates the chart options of the selected chart without a message in the UI
   * @param commit
   * @param state
   * @param rootState
   * @param device device data
   */
  async updateChartOptionsWithoutMessage({ commit, state, rootState }, device: IDevice) {
    if (!rootState.projects.projectId) return;

    const body = {
      period_name: device.data.periodName,
      interval: device.data.interval,
      selected_stacking_options: device.data.selectedStackingOptions,
    };
    const res = await api.fetch(
      `/projects/${rootState.projects.projectId}/devices/chartOptions/${device.id}`,
      "PUT",
      body,
    );
    commit("setDevices", state.devices.set(res.id, res));
  },

  /**
   * Updates selected device with a message in the UI
   * @param commit
   * @param state
   * @param rootState
   * @param device device data
   */
  async updateDevice({ commit, state, rootState }, device: IDevice) {
    if (!rootState.projects.projectId) return;

    const res = await api.fetch(
      `/projects/${rootState.projects.projectId}/devices/${device.id}`,
      "PUT",
      device,
    );
    commit("setDevices", state.devices.set(res.id, res));
    commit(
      "app/setReport",
      {
        type: "success",
        message: i18nInstance.t("uiComponents.reportMessages.editDevice", { name: res.name }),
        value: true,
      },
      { root: true },
    );
  },

  /**
   * Add device to Favorites
   * @param commit
   * @param state
   * @param rootState
   * @param deviceId device id
   */
  async addDeviceToFavorites({ commit, state, rootState }, deviceId) {
    await api.fetch(`/projects/${rootState.projects.projectId}/favorites/${deviceId}`, "PUT");

    const currentDevice = state.devices.get(deviceId);
    if (currentDevice) {
      currentDevice.favorite = true;
      commit("setDevices", state.devices.set(currentDevice.id, currentDevice));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.addToFavorites", {
            name: currentDevice.name,
          }),
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Removes device from Favorites
   * @param commit
   * @param state
   * @param rootState
   * @param deviceId device id
   */
  async removeDeviceFromFavorites({ commit, state, rootState }, deviceId) {
    await api.fetch(`/projects/${rootState.projects.projectId}/favorites/${deviceId}`, "DELETE");

    const currentDevice = state.devices.get(deviceId);
    if (currentDevice) {
      currentDevice.favorite = false;
      commit("setDevices", state.devices.set(currentDevice.id, currentDevice));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.removeFromFavorites", {
            name: currentDevice.name,
          }),
          value: true,
        },
        { root: true },
      );
    }
  },
};

export const devices: Module<IDevicesState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
