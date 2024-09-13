import { Map } from "immutable";
import { add } from "lodash";
import { ActionTree, Dispatch, GetterTree, Module, MutationTree } from "vuex";

import { IRule } from "../rules/types";
import api from "@/store/api";
import { IDevice } from "@/store/modules/devices/types";
import mlModelTypes from "@/store/modules/mpc/mlModelTypes";
import { IMPCState } from "@/store/modules/mpc/types";
import { RootState } from "@/store/types";
import { i18nInstance } from "@/ui/plugins/i18n";
import { envLoadMPC, envMPCDeviceList } from "@/utils/env";

const state: IMPCState = {
  mlModelTypes,
  mpcControllers: Map(),
  isWeatherServiceActive: false,
};

const getters: GetterTree<IMPCState, RootState> = {
  mpcControllers(state: IMPCState) {
    return state.mpcControllers.valueSeq().toJS();
  },
  mpcControllersFavorites(state: IMPCState) {
    if (state.mpcControllers.size >= 1) {
      const mpcList = state.mpcControllers.valueSeq().toJS();
      return mpcList.filter((mpc: any) => mpc.favorite);
    }
    return [];
  },

  /**
   * Only ML Models, filtered from other MPC devices
   * @param state
   */
  mlModelDevices(state: IMPCState) {
    return state.mpcControllers
      .valueSeq()
      .toJS()
      .filter((device: any) =>
        Object.keys(state.mlModelTypes).some((el: string) => el === device.data.type),
      );
  },
  mlModelTypes(state: IMPCState) {
    return state.mlModelTypes;
  },
  mlModelTypeSchemaByKey: (state: IMPCState) => (type: string) => state.mlModelTypes[type],

  /**
   * Goes through mlModelTypes and create options
   * (Example: { value: key, title: i18n translation }) for every item
   * @param state
   */
  mlModelsTypesWithLocaleNamesList(state: IMPCState) {
    let localModelTypes = Object.keys(state.mlModelTypes).map((itemType: string) => ({
      value: itemType,
      title: i18nInstance.t(`mlModel.${itemType}.previewName`),
    }));
    localModelTypes = localModelTypes.filter((element: any) =>
      envMPCDeviceList.includes(element.value),
    );
    return localModelTypes;
  },

  /**
   * Returns MPC devices list with the visibility status of the settings window
   * @param state
   */
  mlModelIsSettings(state: IMPCState) {
    return Object.entries(state.mlModelTypes).map((mlModel: any) => [
      mlModel[0],
      mlModel[1].isSettingsView,
    ]);
  },
};

const mutations: MutationTree<any> = {
  setMPCControllers(state, payload) {
    state.mpcControllers = payload;
  },
  setWeatherServiceStatus(state, status) {
    state.isWeatherServiceActive = status;
  },
};

const actions: ActionTree<any, RootState> = {
  /**
   * Creates new MPC device
   * @param commit
   * @param state
   * @param mpc
   */
  async createMCCInstance({ commit, state, rootState, dispatch }, mpc: IDevice) {
    try {
      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/controllers`,
        "POST",
        mpc,
      );

      const additionalRules = [] as IRule[];

      if (state.mlModelTypes[mpc.data.type].additionalRules) {
        await Promise.all(
          state.mlModelTypes[mpc.data.type].additionalRules?.map(
            async (
              ruleFunc: (deviceData: IDevice, rootState: RootState, dispatch: Dispatch) => any,
            ) => {
              const rule = await ruleFunc(res, rootState, dispatch);
              additionalRules.push(rule);
            },
          ),
        );

        if (additionalRules.length > 0) {
          const addional_rules = await dispatch(
            "rules/addRules",
            {
              project_id: rootState.projects.projectId,
              rulesList: additionalRules,
            },
            { root: true },
          );

          const model_to_update = res;
          model_to_update["data"]["meta"]["addional_rules"] = addional_rules.map(
            (rule: { id: string }) => rule.id,
          );
          return dispatch("updateMPC", model_to_update);
        }
      }
      commit("setMPCControllers", state.mpcControllers.set(res.id, res));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.createMLModel", { name: res.name }),
          value: true,
        },
        { root: true },
      );
    } catch (e: any) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: e?.message,
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Load MPC devices, creates Map collection from them and set to MPC state
   * @param commit
   * @param state
   * @param rootState
   */
  async fetchMPCListByProject({ commit, state, rootState }) {
    if (!envLoadMPC) return;

    try {
      const res = await api.fetch(`/projects/${rootState.projects.projectId}/controllers`, "GET");
      if (res.length) {
        const mpcControls = (res as any[]).reduce(
          (acc, cur) => acc.set(cur.id, cur),
          Map<string, any>(),
        );
        commit("setMPCControllers", mpcControls);
      } else {
        commit("setMPCControllers", Map());
      }
    } catch (e) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: i18nInstance.t("uiComponents.reportMessages.errorLoadingMPCData"),
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Load MPC full data, used in created component hook of MPC devices
   * @param commit
   * @param state
   * @param rootState
   * @param id
   */
  async fetchMPCData({ commit, state, rootState }, id) {
    try {
      return await api.fetch(`/projects/${rootState.projects.projectId}/controllers/${id}`, "GET");
    } catch (e) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: i18nInstance.t("uiComponents.reportMessages.errorLoadingMPCData"),
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Add MPC device to Favorites
   * @param commit
   * @param state
   * @param rootState
   * @param id
   */
  async addMPCToFavorites({ commit, state, rootState }, id) {
    await api.fetch(`/projects/${rootState.projects.projectId}/controllers/${id}/favorites`, "PUT");

    const device: any = state.mpcControllers.get(id);
    if (device) {
      device.favorite = true;
      commit("setMPCControllers", state.mpcControllers.set(device.id, device));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.addToFavorites", {
            name: device.name,
          }),
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Removes MPC device from Favorites
   * @param commit
   * @param state
   * @param rootState
   * @param id
   */
  async removeMPCFromFavorites({ commit, state, rootState }, id) {
    await api.fetch(
      `/projects/${rootState.projects.projectId}/controllers/${id}/favorites`,
      "DELETE",
    );

    const device: any = state.mpcControllers.get(id);
    if (device) {
      device.favorite = false;
      commit("setMPCControllers", state.mpcControllers.set(device.id, device));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.removeFromFavorites", {
            name: device.name,
          }),
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Removes selected MPC device, rules attached to it
   * @param commit
   * @param dispatch
   * @param state
   * @param rootState
   * @param mpc
   */
  async deleteMPC({ commit, dispatch, state, rootState }, mpc) {
    // delete rules
    const warningRuleId = mpc.data.meta.warningRule;
    const errorRuleId = mpc.data.meta.errorRule;
    const additionalRules = mpc.data.meta.addional_rules ?? [];
    const systemsRules = mpc.data.meta.rules ? Object.values(mpc.data.meta.rules) : [];
    const rulesVariablesList: any = systemsRules.length
      ? systemsRules
          .map((system: any) => [system.errorRule, system.warningRule])
          .reduce((acc: any, item: any) => acc.concat(item), [])
      : [];
    const rulesList: any = [warningRuleId, errorRuleId, ...rulesVariablesList, ...additionalRules]
      .filter((el: any) => !!el)
      .map((variable: string) =>
        dispatch(
          "rules/deleteRule",
          { project_id: mpc.project_id, rule_id: variable },
          { root: true },
        ),
      );
    await Promise.all(rulesList);
    // delete ems
    await api.fetch(`/projects/${rootState.projects.projectId}/controllers/${mpc.id}`, "DELETE");

    commit("setMPCControllers", state.mpcControllers.remove(mpc.id));
    commit(
      "app/setReport",
      {
        type: "success",
        message: i18nInstance.t("uiComponents.reportMessages.deleteMLModel"),
        value: true,
      },
      { root: true },
    );
  },

  /**
   * Updates selected MPC device
   * @param commit
   * @param state
   * @param mpc
   */
  async updateMPC({ commit, state, rootState }, mpc) {
    try {
      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/controllers/${mpc.id}`,
        "PUT",
        mpc,
      );
      commit("setMPCControllers", state.mpcControllers.set(res.id, res));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.editMLModel", { name: res.name }),
          value: true,
        },
        { root: true },
      );
    } catch (e: any) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: e?.message,
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Load MPC weather status, affects on visibility MPC content
   * @param commit
   * @param state
   * @param rootState
   */
  async fetchMPCWeatherStatus({ commit, state, rootState }) {
    try {
      const res = await api.fetch(`/projects/${rootState.projects.projectId}/weather`, "GET");
      commit("setWeatherServiceStatus", res.site_active);
    } catch (e) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: i18nInstance.t("uiComponents.reportMessages.errorFetchWeatherService"),
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Activate MPC weather service
   * @param commit
   * @param state
   * @param rootState
   * @param payload
   */
  async activateWeatherService({ commit, state, rootState }, payload) {
    try {
      await api.fetch(`/projects/${rootState.projects.projectId}/weather`, "POST", payload);
      commit("setWeatherServiceStatus", true);
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.weatherServiceEnabled"),
          value: true,
        },
        { root: true },
      );
    } catch (e) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: i18nInstance.t("uiComponents.reportMessages.errorFetchWeatherService"),
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Deactivate MPC weather service
   * @param commit
   * @param state
   * @param rootState
   */
  async deactivateWeatherService({ commit, state, rootState }) {
    try {
      await api.fetch(`/projects/${rootState.projects.projectId}/weather`, "DELETE");
      commit("setWeatherServiceStatus", false);
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.weatherServiceDisabled"),
          value: true,
        },
        { root: true },
      );
    } catch (e) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: i18nInstance.t("uiComponents.reportMessages.errorFetchWeatherService"),
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Load Autarkiegrad according to selected period
   * @param commit
   * @param project_id
   * @param start start date
   * @param end end date
   * @param params combined from systems instances string
   */
  async fetchAutarkiegrad({ commit, rootState }, { start, end, params }) {
    try {
      return await api.fetch(
        `/projects/${rootState.projects.projectId}/autarchy/${start}/${end}?${params}`,
        "GET",
      );
    } catch (e) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: i18nInstance.t("uiComponents.reportMessages.errorFetchAutarkiegrad"),
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Updates tariff settings
   * @param commit
   * @param state
   * @param mpc_id
   * @param settings
   */
  async updateTariffSettings({ commit, state, rootState }, { mpcId, settings }) {
    try {
      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/controllers/${mpcId}/settings`,
        "PUT",
        { settings },
      );
      commit("setMPCControllers", state.mpcControllers.set(res.id, res));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.tariffUpdated"),
          value: true,
        },
        { root: true },
      );
    } catch (e: any) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: e?.message,
          value: true,
        },
        { root: true },
      );
    }
  },

  /**
   * Updates temperature settings of Setpoint Optimizer
   * @param commit
   * @param mpc_id
   * @param settings
   */
  async updateSetpointSystemInstanceTemperatureSettings(
    { commit, rootState },
    { mpc_id, settings },
  ) {
    try {
      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/controllers/${mpc_id}/settings`,
        "PUT",
        { settings },
      );
      commit("setMPCControllers", state.mpcControllers.set(res.id, res));
      commit(
        "app/setReport",
        {
          type: "success",
          message: "Temperature settings updated",
          value: true,
        },
        { root: true },
      );
    } catch (e: any) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: e?.message,
          value: true,
        },
        { root: true },
      );
    }
  },

  async updateSetpointOptimizerSettings({ commit, state, rootState }, { mpcId, settings }) {
    try {
      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/controllers/${mpcId}/settings`,
        "PUT",
        { settings },
      );
      commit("", state.mpcControllers.set(res.id, res));
      commit(
        "app/setReport",
        {
          type: "success",
          message: "SPO Settings updated",
          value: true,
        },
        { root: true },
      );
    } catch (e: any) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: e?.message,
          value: true,
        },
        { root: true },
      );
    }
  },

  async updateLoadMonitorSettings({ commit, state, rootState }, { mpcId, settings }) {
    try {
      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/controllers/${mpcId}/settings`,
        "PUT",
        { settings },
      );
      commit("", state.mpcControllers.set(res.id, res));
      commit(
        "app/setReport",
        {
          type: "success",
          message: "Load Monitor Settings updated",
          value: true,
        },
        { root: true },
      );
    } catch (e: any) {
      commit(
        "app/setReport",
        {
          type: "error",
          message: e?.message,
          value: true,
        },
        { root: true },
      );
    }
  },
};

export const mpc: Module<IMPCState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
