import { ResponseType } from "axios";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import { IReport, IReportState } from "./types";
import api from "@/store/api";
import { RootState } from "@/store/types";

const state: IReportState = {
  reportList: [],
};

const getters: GetterTree<IReportState, RootState> = {};

const mutations: MutationTree<IReportState> = {
  setReports(state: IReportState, reports: IReport[]) {
    state.reportList = reports;
  },
  setReport(state: IReportState, report: IReport) {
    state.reportList.push(report);
  },
  deleteReportFromList(state: IReportState, reportId: string) {
    state.reportList = state.reportList.filter((el: IReport) => el.id !== reportId);
  },
};

const actions: ActionTree<IReportState, RootState> = {
  /**
   * load projects reports
   * @param commit
   * @param project_id
   */
  async loadReports({ commit }, project_id) {
    const result = await api.fetch(`/projects/${project_id}/reports`, "GET");
    commit("setReports", result);
  },

  /**
   * fetch all reports from api
   * kinda the same as loadReports so --> TODO: REFACTOR
   */
  async fetchReports({ commit, state, rootState }) {
    const result = await api.fetch(`/projects/${rootState.projects.projectId}/reports`, "GET");
    commit("setReports", result);
  },

  /**
   * Creates new report
   * @param commit
   * @param payLoad
   */
  async addReport({ commit }, payLoad: any) {
    const res = await api.fetch(`/projects/${payLoad.id}/reports`, "POST", payLoad.reportModel);
    commit("setReport", res);
  },

  /**
   * Updates selected report
   * @param commit
   * @param payLoad
   */
  async modifyReport({ commit }, payLoad: any) {
    await api.fetch(
      `/projects/${payLoad.id}/reports/${payLoad.report_id}`,
      "PUT",
      payLoad.reportModel,
    );
    commit(
      "app/setReport",
      {
        type: "success",
        message: "report updated",
        value: true,
      },
      { root: true },
    );
  },

  /**
   * Delete selected project
   * @param commit
   * @param state
   * @param project_id
   * @param report_id
   */
  async deleteReport({ commit, state }, { project_id, report_id }) {
    await api.fetch(`/projects/${project_id}/reports/${report_id}`, "DELETE");
    commit("deleteReportFromList", report_id);
    commit(
      "app/setReport",
      {
        type: "success",
        message: "report deleted",
        value: true,
      },
      { root: true },
    );
  },

  /**
   * Print selected project to pdf or json
   * @param commit
   * @param state
   * @param payLoad
   */
  async printReport({ commit, state }, payLoad: any) {
    let responseType: ResponseType | undefined;
    if (payLoad.format === "pdf") {
      responseType = "arraybuffer";
    }
    const res = await api.fetch(
      `/projects/${payLoad.project_id}/reports/${payLoad.report_id}?format=${payLoad.format}&start=${payLoad.start}&end=${payLoad.end}`,
      "GET",
      undefined,
      undefined,
      responseType,
    );
    if (
      payLoad.format === "json" ||
      payLoad.format === "csv" ||
      payLoad.format === "pdf" ||
      payLoad.format === "xml"
    ) {
      return res;
    }
  },

  /**
   * Trigger report action
   * @param commit
   * @param state
   * @param payLoad
   */
  async triggerReportActions({ commit, state }, payLoad: any) {
    await api.fetch(
      `/projects/${payLoad.id}/reports/${payLoad.report_id}?action=true&start=${payLoad.start}&end=${payLoad.end}&format=${payLoad.format}`,
      "GET",
      payLoad.reportModel,
    );
    commit(
      "app/setReport",
      {
        type: "success",
        message: "Actions Triggered",
        value: true,
      },
      { root: true },
    );
  },
};

export const report: Module<IReportState, RootState> = {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
};
