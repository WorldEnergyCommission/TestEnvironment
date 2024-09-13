import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import anomalyDetectionTypes from "@/store/modules/anomalyDetection/anomalyDetectionTypes";
import { IAnomalyDetectionState } from "@/store/modules/anomalyDetection/types";
import { RootState } from "@/store/types";
import { i18nInstance } from "@/ui/plugins/i18n";

const state: IAnomalyDetectionState = {
  anomalyDetectionTypes,
};

const getters: GetterTree<IAnomalyDetectionState, RootState> = {
  /**
   * Filters from MPC devices Anomaly Detected devices
   * @param state
   * @param getters
   * @param rootState
   * @param rootGetters
   */
  anomalyDetectionDevices(state, getters, rootState, rootGetters) {
    return rootGetters["mpc/mpcControllers"].filter((device: any) =>
      Object.keys(state.anomalyDetectionTypes).some((el: string) => el === device.data.type),
    );
  },

  /**
   * Goes through anomalyDetectionTypes and create options
   * (Example: { value: key, title: i18n translation }) for every item
   * @param state
   */
  anomalyDetectionTypesWithLocaleNamesList(state) {
    return Object.keys(state.anomalyDetectionTypes).map((itemType: string) => ({
      value: itemType,
      title: i18nInstance.t(`anomalyDetection.${itemType}.previewName`),
    }));
  },
};

const mutations: MutationTree<IAnomalyDetectionState> = {};

const actions: ActionTree<IAnomalyDetectionState, RootState> = {};

export const anomalyDetection: Module<IAnomalyDetectionState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
