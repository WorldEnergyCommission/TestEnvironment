import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import api from "@/store/api";
import { IModulesState, ModuleType } from "@/store/modules/modules/types";
import { RootState } from "@/store/types";

const state: IModulesState = {
  modulesWithMappings: Map(),
};

const getters: GetterTree<IModulesState, RootState> = {
  listWithMappings(state: IModulesState): ModuleType[] {
    return state.modulesWithMappings.valueSeq().toJS() as ModuleType[];
  },
};

const mutations: MutationTree<IModulesState> = {
  setModulesWithMappings(state: IModulesState, devices: Map<string, ModuleType>) {
    state.modulesWithMappings = devices;
  },
};
const actions: ActionTree<IModulesState, RootState> = {
  /**
   * Load devices list, creates Map collection from them and set to devices state
   * @param commit
   * @param state
   * @param rootState
   */
  async fetchModulesWihtMappings({ commit, state, rootState }) {
    const response = await api.fetch(
      `/projects/${rootState.projects.projectId}/modules/list?includeMappings=true`,
      "GET",
    );
    const modules = (response as ModuleType[]).reduce(
      (acc, cur) => acc.set(cur.id, cur),
      Map<string, ModuleType>(),
    );
    commit("setModulesWithMappings", modules);
  },
};

export const modules: Module<IModulesState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
