import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import { generateRoomsDndLayout } from "./utils";
import api from "@/store/api";
import { IRoom, IRoomsState } from "@/store/modules/rooms/types";
import { RootState } from "@/store/types";
import { i18nInstance } from "@/ui/plugins/i18n";

const state: IRoomsState = {
  rooms: Map(),
  currentRoomId: "",
};

const getters: GetterTree<IRoomsState, RootState> = {
  rooms(state: IRoomsState) {
    return state.rooms.valueSeq().toJS();
  },

  dndLayout(state: IRoomsState, getters: any) {
    const layout = generateRoomsDndLayout(getters.roomPositions, state.rooms.valueSeq().toJS());
    return layout;
  },

  roomPositions(state: IRoomsState, getters: any, rootState: RootState) {
    if (rootState.projects.project?.meta?.roomsPositions)
      return rootState.projects.project.meta.roomsPositions;
    return [];
  },
  currentRoom(state: IRoomsState) {
    return state.currentRoomId;
  },
  currentRoomData(state: IRoomsState) {
    return state.rooms.get(state.currentRoomId);
  },
};

const mutations: MutationTree<IRoomsState> = {
  setRooms(state: IRoomsState, rooms: Map<string, IRoom>) {
    state.rooms = rooms;
  },
  setCurrentRoomId(state: IRoomsState, id: string) {
    state.currentRoomId = id;
  },
};

const actions: ActionTree<IRoomsState, any> = {
  /**
   * Load rooms
   * @param commit
   * @param rootState
   * @param payload
   */
  async fetchRooms({ commit, rootState }, payload) {
    try {
      const res = await api.fetch(`/projects/${payload}/collections`, "GET");
      const rooms = (res as IRoom[]).reduce(
        (acc, cur) => acc.set(cur.id, cur),
        Map<string, IRoom>(),
      );
      commit("setRooms", rooms);
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
   * Creates room
   * @param dispatch
   * @param commit
   * @param state
   * @param rootState
   * @param payload
   */
  async createRoom({ dispatch, commit, state, rootState }, payload: any) {
    let assetResponse;
    let { cover } = payload.room;

    if (payload.cover) {
      if (payload.coverType === "picture") {
        assetResponse = await dispatch("projects/postProjectAsset", payload.cover, { root: true });
        cover = `/assets/${assetResponse}`;
      } else if (payload.coverType === "icon") {
        cover = `/icons/${payload.cover}.svg`;
      }
    }

    const roomResponse: IRoom = await api.fetch(
      `/projects/${rootState.projects.projectId}/collections`,
      "POST",
      {
        name: payload.room.name,
        meta: {
          cover,
          devicesPositions: undefined,
        },
      },
    );
    commit("setRooms", state.rooms.set(roomResponse.id, roomResponse));
    commit(
      "app/setReport",
      {
        type: "success",
        message: i18nInstance.t("uiComponents.reportMessages.createArea"),
        value: true,
      },
      { root: true },
    );
  },

  /**
   * Delete selected room
   * @param commit
   * @param state
   * @param dispatch
   * @param rootState
   * @param roomId
   */
  async deleteRoom({ commit, state, dispatch, rootState }, roomId: string) {
    try {
      await api.fetch(`/projects/${rootState.projects.projectId}/collections/${roomId}`, "DELETE");
      commit("setRooms", state.rooms.remove(roomId));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.deleteArea"),
          value: true,
        },
        { root: true },
      );
      rootState.devices.allDevices.forEach((device: any) => {
        if (device.room !== roomId) return;
        dispatch("devices/deleteDevice", device, { root: true });
      });
      rootState.mpc.mpcControllers.forEach((mpc: any) => {
        if (mpc.collection_id !== roomId) return;
        dispatch("mpc/deleteMPC", mpc.id, { root: true });
      });
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
   * Updates selected room
   * @param commit
   * @param state
   * @param rootState
   * @param dispatch
   * @param payload
   */
  async updateRoom({ commit, state, rootState, dispatch }, payload) {
    if (!payload.room?.id) return;
    let assetResponse;
    let { cover } = payload.room?.meta ?? "";

    if (payload.cover) {
      if (payload.coverType === "picture") {
        assetResponse = await dispatch("projects/postProjectAsset", payload.cover, { root: true });
        cover = `/assets/${assetResponse}`;
      } else if (payload.coverType === "icon") {
        cover = `/icons/${payload.cover}.svg`;
      }
    }

    const roomResponse: IRoom = await api.fetch(
      `/projects/${rootState.projects.projectId}/collections/${payload.room.id}`,
      "PUT",
      {
        name: payload.room.name,
        meta: {
          cover,
          devicesPositions: payload.room?.meta?.devicesPositions || undefined,
        },
      },
    );
    commit("setRooms", state.rooms.set(roomResponse.id, roomResponse));
    commit(
      "app/setReport",
      {
        type: "success",
        message: i18nInstance.t("uiComponents.reportMessages.editArea"),
        value: true,
      },
      { root: true },
    );
  },
};

export const rooms: Module<IRoomsState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
