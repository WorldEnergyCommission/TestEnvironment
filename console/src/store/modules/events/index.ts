import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import { IEventState } from "./types";
import api from "@/store/api";
import { RootState } from "@/store/types";

const state: any = {
  eventList: [],
  eventListFilter: "",
};

const getters: GetterTree<IEventState, RootState> = {
  /**
   * Returns events filtered by eventListFilter
   * @param state
   */
  getEventList(state) {
    return state.eventListFilter
      ? state.eventList.filter((item: any) =>
          Object.values(item).join().toLowerCase().includes(state.eventListFilter),
        )
      : state.eventList;
  },

  /**
   * Returns accepted events
   * @param state
   */
  getIsAllAccepted(state) {
    let counterNotAccepted = 0;
    Object.values(state.eventList).forEach((element: any) => {
      if (element.accepted_at === "" || element.accepted_at === null) {
        counterNotAccepted++;
      }
    });
    return counterNotAccepted !== 0;
  },
};

const mutations: MutationTree<any> = {
  setEventsList(state, events) {
    state.eventList = events;
  },
  acceptEvent(state, payLoad: { newEvent: any }) {
    state.eventList.forEach((item: any, index: number) => {
      if (item.id === payLoad.newEvent.id) {
        state.eventList.splice(index, 1);
        state.eventList.splice(index, 0, payLoad.newEvent);
      }
    });
  },
  acceptAllEvents(state, payLoad: { formattedDate: IEventState; fullName: string }) {
    state.eventList.forEach((item: any) => {
      if (item.accepted_by === "ACCEPT") {
        item.accepted_at = payLoad.formattedDate;
        item.accepted_by = payLoad.fullName;
      }
    });
  },
  setEventListFilter(state, value: string) {
    state.eventListFilter = value;
  },
};

const actions: ActionTree<IEventState, RootState> = {
  /**
   * Accept selected event
   * @param commit
   * @param state
   * @param rootState
   * @param payLoad
   */
  async acceptOneEvent({ commit, state, rootState }, payLoad: { id: any }) {
    const event = await api.fetch(
      `/projects/${rootState.projects.projectId}/alerts/${payLoad.id}`,
      "PUT",
    );
    commit("acceptEvent", { newEvent: event });
    return event;
  },

  /**
   * Accepts all events
   * @param commit
   * @param state
   * @param rootState
   * @param payLoad
   */
  async acceptEveryEvent({ commit, state, rootState }, payLoad: { id: any }) {
    await api.fetch(`/projects/${rootState.projects.projectId}/alerts`, "PUT");
  },

  /**
   * Load events list according to selected page
   * @param commit
   * @param state
   * @param rootState
   * @param payload
   */
  async loadEvents({ commit, state, rootState }, payload: { page: any; bol: any }) {
    const res = await api.fetch(
      `/projects/${rootState.projects.projectId}/alerts?page=${payload.page}&accepted=${payload.bol}`,
      "GET",
    );
    commit("setEventsList", res.data);
    return res;
  },
};

export const events: Module<IEventState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
