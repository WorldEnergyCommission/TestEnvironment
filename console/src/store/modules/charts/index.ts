import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import api from "@/store/api";
import { FetchChartAggParams, IChartsState } from "@/store/modules/charts/types";
import { RootState } from "@/store/types";

const state: IChartsState = {
  chartsTypes: {
    chart: {
      mappings: ["value"],
    },
    LineChart: {
      mappings: ["value"],
    },
    ColumnChart: {
      mappings: ["value"],
    },
    AreaChart: {
      mappings: ["value"],
    },
    GaugeChart: {
      mappings: ["value"],
    },
  },
};

const getters: GetterTree<IChartsState, RootState> = {
  charts(state, getters, rootState, rootGetters) {
    return rootGetters["devices/allDevices"].filter((device: any) =>
      Object.keys(state.chartsTypes).some((item) => item === device.data.type),
    );
  },
};

const mutations: MutationTree<IChartsState> = {};

const actions: ActionTree<IChartsState, RootState> = {
  async fetchChart({ commit, rootState }, { projectId, chartName, from, to }) {
    return api.fetch(
      `/projects/${projectId}/measurements/${chartName}/history?from=${from}&to=${to}`,
      "GET",
    );
  },

  /**
   * Fetches aggregated chart data
   */
  async fetchChartAgg({ commit, rootState }, params: FetchChartAggParams) {
    return api.fetch(
      `/projects/${rootState.projects.projectId}/measurements/${params.variable}/chart?\
start=${params.from}&end=${params.to}&agg=${params.agg}&int=${params.interval}&tz=${
        params.tz ?? ""
      }&miss=${params.miss ?? ""}`,
      "GET",
    );
  },
  async fetchChartByExactTime({ commit, rootState }, { projectId, chartName, time }) {
    return api.fetch(`/projects/${projectId}/measurements/${chartName}?time=${time}`, "GET");
  },
};

export const charts: Module<IChartsState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
