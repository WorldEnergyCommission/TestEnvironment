import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import api from "@/store/api";
import { IMember, IMemberState } from "@/store/modules/members/types";
import { RootState } from "@/store/types";

const state: IMemberState = {
  members: Map(),
  currentMember: null,
};

const getters: GetterTree<IMemberState, RootState> = {
  members(state: IMemberState) {
    return state.members.valueSeq().toJS();
  },

  /**
   * Returns if current member has a permission
   * @param state IMemberState
   * @param permission String
   * @returns boolean
   */
  hasPermission(state: IMemberState) {
    return (permission: string) => {
      return state.currentMember && state.currentMember?.permissions
        ? state.currentMember?.permissions.map((permission) => permission.id).includes(permission)
        : false;
    };
  },

  /**
   * Returns if current member has a permission
   * @param state IMemberState
   * @param permission String
   * @returns boolean
   */
  hasScopedPermission(state: IMemberState) {
    return (permissionId: string, scopeId: string) => {
      const has =
        state.currentMember && state.currentMember?.permissions
          ? state.currentMember?.permissions.filter(
              (permission) =>
                permission.id === permissionId &&
                (permission.scope_reference === scopeId || permission.scope === "*"),
            ).length > 0
          : false;
      return has;
    };
  },
};

const mutations: MutationTree<IMemberState> = {
  setMembers(state: IMemberState, members: Map<string, IMember>) {
    state.members = members;
  },
  setCurrentMember(state: IMemberState, member: IMember) {
    state.currentMember = member;
  },
};

const actions: ActionTree<IMemberState, RootState> = {
  /**
   * Creates new member
   * @param commit
   * @param state
   * @param rootState
   * @param member member data
   */
  async createMember({ commit, state, rootState }, id: string) {
    try {
      const res = await api.fetch(`/projects/${rootState.projects.projectId}/members`, "POST", {
        id,
        role: "projectUser",
      });
      commit("setMembers", state.members.set(id, res));
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * Updates selected member
   * @param commit
   * @param state
   * @param rootState
   * @param member member data
   */
  async updateMember({ commit, state, rootState }, member: IMember) {
    try {
      const { role, id } = member;
      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/members/${id}`,
        "PUT",
        { role },
      );
      commit("setMembers", state.members.set(member.id, member));
      commit(
        "app/setReport",
        { type: "success", message: "member was updated", value: true },
        { root: true },
      );
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * Delete selected member
   * @param commit
   * @param state
   * @param rootState
   * @param member member data
   */
  async deleteMember({ commit, state, rootState }, member: IMember) {
    try {
      await api.fetch(`/projects/${rootState.projects.projectId}/members/${member.id}`, "DELETE");
      commit("setMembers", state.members.delete(member.id));
      commit(
        "app/setReport",
        { type: "success", message: "member was removed", value: true },
        { root: true },
      );
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * Load members attached to project
   * @param commit
   * @param state
   * @param projectId project id
   */
  async fetchMembers({ commit, state }, projectId) {
    try {
      const res = await api.fetch(`/projects/${projectId}/members`, "GET");
      const members = (res as IMember[]).reduce(
        (acc, cur) => acc.set(cur.id, cur),
        Map<string, IMember>(),
      );
      commit("setMembers", members);
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * Load member
   * @param commit
   * @param state
   * @param rootState
   * @param memberId member id
   * @param projectId project id
   */
  async fetchMember({ commit, state, rootState }, { memberId, projectId }) {
    try {
      const res = await api.fetch(`/projects/${projectId}/members/${memberId}`, "GET");
      commit("setCurrentMember", res);
    } catch (e) {
      console.log(e);
    }
  },
};

export const members: Module<IMemberState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
