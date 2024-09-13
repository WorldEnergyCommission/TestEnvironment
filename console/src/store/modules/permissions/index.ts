import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import { IPermission, IPermissionState, IPossiblePermissionScope } from "./types";
import api from "@/store/api";
import { RootState } from "@/store/types";

const state: IPermissionState = {
  permissions: Map(),
  memberPermission: Map(),
  groups: [],
  possiblePermisssions: [],
};

const getters: GetterTree<IPermissionState, RootState> = {
  permissions: (state: IPermissionState) => {
    return state.permissions.valueSeq().toJS();
  },

  permissionsForMember: (state: IPermissionState) => (memberId: string) => {
    const permissions = state.memberPermission.get(memberId);
    return permissions ?? [];
  },
  hasPlatformPermission(state: IPermissionState) {
    return (permission: string) => {
      return state.platformPermissions
        ? state.platformPermissions.map((permission) => permission.id).includes(permission)
        : false;
    };
  },
};

const mutations: MutationTree<IPermissionState> = {
  setPermissions(state: IPermissionState, permissions: Map<string, IPermission>) {
    state.permissions = permissions;
  },

  setPermissionsForMember(
    state: IPermissionState,
    payload: { permissions: IPermission[]; memberId: string },
  ) {
    state.memberPermission = state.memberPermission.set(payload.memberId, payload.permissions);
  },

  setPermissionGroups(state: IPermissionState, groups: string[]) {
    state.groups = groups;
  },

  setPossiblePermisssions(state: IPermissionState, permissions: IPossiblePermissionScope[]) {
    state.possiblePermisssions = permissions;
  },
  setPlatformPermissions(state, permissions: IPermission[]) {
    state.platformPermissions = permissions;
  },
};

const actions: ActionTree<IPermissionState, RootState> = {
  /**
   * Load all possible permissions
   * @param commit
   */
  async fetchPermissions({ commit }) {
    try {
      const res = await api.fetch("/permissions", "GET");
      const permissions = (res as IPermission[]).reduce(
        (acc, cur) => acc.set(cur.id, cur),
        Map<string, IPermission>(),
      );
      commit("setPermissions", permissions);
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * Load all permission groups
   * @param commit
   */
  async fetchPermissionGroups({ commit }) {
    try {
      const res = await api.fetch("/permissions/groups", "GET");
      commit("setPermissionGroups", res);
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * Load permissions for member
   * @param commit
   * @param state
   * @param projectId project id
   */
  async fetchPermissionsForMember({ commit, state, rootState }, memberId: string) {
    try {
      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/members/${memberId}/permissions`,
        "GET",
      );
      const permissions = res as IPermission[];
      commit("setPermissionsForMember", { permissions, memberId });
    } catch (e) {
      console.log(e);
    }
  },

  async createPermissionsForMember(
    { commit, state, rootState },
    toCreate: { memberId: string; permissions: string[]; scopes: string[]; wildcard: boolean },
  ) {
    try {
      const { memberId, permissions, scopes, wildcard } = toCreate;

      const payload: { permissions: string[]; scopes?: string[]; wildcard: boolean } = {
        permissions,
        wildcard,
      };

      if (!wildcard) {
        payload.scopes = scopes;
      }

      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/members/${memberId}/permissions`,
        "POST",
        payload,
      );
      const newPermissions = res as IPermission[];
      commit("setPermissionsForMember", { permissions: newPermissions, memberId });
    } catch (e) {
      console.log(e);
    }
  },

  async deletePermissionForMember(
    { commit, dispatch, state, rootState },
    toDelete: { memberId: string; permission: string; scope: string },
  ) {
    try {
      const { memberId, permission, scope } = toDelete;

      await api.fetch(
        `/projects/${rootState.projects.projectId}/members/${memberId}/permissions`,
        "DELETE",
        { permission, scope_id: scope },
      );
      return dispatch("fetchPermissionsForMember", memberId);
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * Load all permission groups
   * @param commit
   */
  async fetchPossiblePermissionScopes({ commit, rootState }, permissionId: string) {
    try {
      const res = await api.fetch(
        `/projects/${rootState.projects.projectId}/permissions/${permissionId}/scopes`,
        "GET",
      );
      commit("setPossiblePermisssions", res);
    } catch (e) {
      console.log(e);
    }
  },

  /**
   * Load all platform permissions for user from API
   * @param param0
   */
  async fetchPlatformPermissions({ commit, rootState }) {
    const permissions = await api.fetch("/users/me/permissions", "GET");
    commit("setPlatformPermissions", permissions);
  },
};

export const permissions: Module<IPermissionState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
