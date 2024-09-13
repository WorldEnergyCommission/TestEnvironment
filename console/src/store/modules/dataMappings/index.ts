import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import { DataMapping, IDataMappingsState } from "./types";
import api from "@/store/api";
import { RootState } from "@/store/types";

const state: IDataMappingsState = {
  dataMappings: Map(),
};

const getters: GetterTree<IDataMappingsState, RootState> = {
  list(state: IDataMappingsState): DataMapping[] {
    return state.dataMappings.valueSeq().toJS() as DataMapping[];
  },
  filteredByType(state, getters) {
    return (type_id: string) =>
      (getters.list as DataMapping[]).filter((device) => device.type_id == type_id);
  },
  filteredByTypeName(state, getters) {
    return (type: string) =>
      (getters.list as DataMapping[]).filter((device) => device.type == type);
  },
};

const mutations: MutationTree<IDataMappingsState> = {
  setDataMappings(state: IDataMappingsState, mappings: Map<string, DataMapping>) {
    state.dataMappings = mappings;
  },
};
const actions: ActionTree<IDataMappingsState, RootState> = {
  /**
   * Load devices list, creates Map collection from them and set to devices state
   * @param commit
   * @param state
   * @param rootState
   */
  async fetchDataMappings({ commit, state, rootState }) {
    const response = await api.fetch(
      `/projects/${rootState.projects.projectId}/data-mapping/list`,
      "GET",
    );
    const dataMappings = (response as DataMapping[]).reduce(
      (acc, cur) => acc.set(cur.id, cur),
      Map<string, DataMapping>(),
    );
    commit("setDataMappings", dataMappings);
  },
};

export const dataMappings: Module<IDataMappingsState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
