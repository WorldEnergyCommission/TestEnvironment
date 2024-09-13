import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import { IRecord } from "../devices/types";
import api from "@/store/api";
import { IVariablesState } from "@/store/modules/measurements/types";
import { RootState } from "@/store/types";

const state: IVariablesState = {
  measurements: Map(),
  measurement: () => "",
  measurementsKeys: [],
  measurementsFilter: "",
};

const getters: GetterTree<IVariablesState, RootState> = {
  measurements(state: IVariablesState) {
    return state.measurements.toJS();
  },

  measurement: (state: IVariablesState) => (variable: string) => {
    return state.measurements.get(variable);
  },

  /**
   * Filters measurements by name length
   * @param state
   */
  measurementsKeys(state: IVariablesState) {
    return state.measurements
      .keySeq()
      .filter((variable) => variable)
      .toJS();
  },
};

const mutations: MutationTree<IVariablesState> = {
  setMeasurements(state: IVariablesState, measurements: Map<string, string | number>) {
    state.measurements = measurements;
  },
  setMeasurementsKeys(state: IVariablesState, measurements: any) {
    state.measurementsKeys = Object.keys(measurements);
  },
  setMeasurement(state: IVariablesState, record: any) {
    if (record.vs) {
      state.measurements = state.measurements.set(record.n, record.vs);
    } else {
      state.measurements = state.measurements.set(record.n, record.v);
    }
  },
  setMeasurementsFilter(state: IVariablesState, name: string) {
    state.measurementsFilter = name;
  },
};

const actions: ActionTree<IVariablesState, RootState> = {
  /**
   * Load project measurements
   * @param commit
   * @param projectId
   */
  async fetchMeasurements({ commit }, projectId) {
    try {
      const measurements = await api.fetch(`/projects/${projectId}/measurements`, "GET");
      commit("setMeasurements", Map(measurements));
      commit("setMeasurementsKeys", measurements);
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

  async publishMeasurement({ commit, rootState }, payload: IRecord) {
    try {
      const measurements = await api.fetch(
        `/projects/${rootState.projects.projectId}/measurements/${payload.n}/publish`,
        "POST",
        payload,
      );
      (measurements as IRecord[]).forEach((record) => commit("setMeasurement", record));
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

export const measurements: Module<IVariablesState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
