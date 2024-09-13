import axios from "axios";
import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import api from "@/store/api";
import { IProject, IProjectsState } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import { i18nInstance } from "@/ui/plugins/i18n";
import { envDomain } from "@/utils/env";

const state: IProjectsState = {
  projectId: null,
  projectStatus: null,
  projects: Map(),
  project: {},
  projectsFilter: "",
  mqttInfo: {},
  lastHeartbeatMessage: 0,
  dndActive: false,
};

const getters: GetterTree<IProjectsState, RootState> = {
  project(state: IProjectsState) {
    if (!state.projectId) return;
    return state.projects.get(state.projectId);
  },
  projects(state: IProjectsState) {
    return state.projects.valueSeq().toJS();
  },
  startOfTheProject(state: IProjectsState) {
    return new Date(state.project.created_at).getTime();
  },
  isDnDActive(state: IProjectsState) {
    return state.dndActive;
  },
};

const mutations: MutationTree<IProjectsState> = {
  setProjectId(state: IProjectsState, projectId: string) {
    state.projectId = projectId;
  },
  setProjects(state: IProjectsState, projects: Map<string, IProject>) {
    state.projects = projects;
  },
  setProject(state: IProjectsState, project: IProject) {
    state.project = project;
    state.dndActive = false;
  },
  setProjectStatus(state: IProjectsState, status: boolean) {
    state.projectStatus = status;
  },
  setProjectFilter(state: IProjectsState, name: string) {
    state.projectsFilter = name;
  },
  setMqttInfo(state: IProjectsState, info: any) {
    state.mqttInfo = info;
  },
  setLastHeartbeatMessage(state: IProjectsState, value) {
    state.lastHeartbeatMessage = value;
  },
  toggleDnD(state: IProjectsState) {
    state.dndActive = !state.dndActive;
  },
  setDocuments(state: IProjectsState, value) {
    state.documents = value;
  },
};

const actions: ActionTree<IProjectsState, RootState> = {
  /**
   * Load project list, creates Map collection from them and set to project state
   * @param commit
   */
  async loadProjects({ commit }) {
    try {
      const data = await api.fetch("/projects", "GET");
      const projects = (data as IProject[]).reduce((acc, cur) => {
        return acc.set(cur.id, cur);
      }, Map<string, IProject>());
      commit("setProjects", projects);
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
   * Creates new project
   * @param commit
   * @param state
   * @param project
   */
  async createProject({ commit, state }, project: any) {
    try {
      const result = await api.fetch("/projects", "POST", project);
      commit("setProjects", state.projects.set(result.id, result));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.createProject"),
          value: true,
        },
        { root: true },
      );
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
   * Delete selected project
   * @param commit
   * @param state
   * @param projectId
   */
  async deleteProject({ commit, state }, projectId: string) {
    try {
      await api.fetch(`/projects/${projectId}`, "DELETE");
      commit("setProjects", state.projects.remove(projectId));
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.deleteProject"),
          value: true,
        },
        { root: true },
      );
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
   * Load project
   * @param commit
   * @param projectId
   */
  async loadProject({ commit }, projectId: string) {
    try {
      const project = await api.fetch(`/projects/${projectId}`, "GET");
      commit("setProjectId", project.id);
      commit("setProject", project);
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
   * Updates selected project
   * @param commit
   * @param state
   * @param project
   */
  async updateProject({ commit, state }, project: IProject) {
    try {
      const res = await api.fetch(`/projects/${project.id}`, "PUT", project);
      commit("setProjects", state.projects.set(res.id, res));
      commit("setProject", res);
      commit(
        "app/setReport",
        {
          type: "success",
          message: i18nInstance.t("uiComponents.reportMessages.updateProject"),
          value: true,
        },
        { root: true },
      );
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
   * Upload file
   * @param commit
   * @param state
   * @param {File} asset file object
   */
  async postProjectAsset({ commit, state }, asset: any) {
    try {
      if (!asset || !asset.name) return;
      const data = new FormData();
      data.append("file", new Blob([asset]));
      return await api.fetch(`/projects/${state.projectId}/assets`, "POST", data);
    } catch (e) {
      console.log(e);
    }
  },
  /**
   * Post operating hours for project to api
   * @param commit
   * @param state
   * @param {any} data operating hours object to save
   */
  async postProjectOperatingHours({ dispatch, state }, data: any) {
    try {
      const response = await api.fetch(
        `/projects/${state.projectId}/operating-hours`,
        "POST",
        data,
      );
      dispatch("loadProject", state.projectId);
      return response;
    } catch (e) {
      console.log(e);
    }
  },
  /**
   * Post operating hours for project to api
   * @param commit
   * @param state
   * @param {any} data operating hours object to save
   */
  async postHolidays({ dispatch, state }, data: any) {
    try {
      await api.fetch(`/projects/${state.projectId}/holidays`, "POST", data);
      dispatch("loadProject", state.projectId);
    } catch (e) {
      console.log(e);
    }
  },
  /**
   * Load operating hours for project to api
   * @param commit
   * @param state
   * @param {any} data operating hours object to save
   */
  async loadProjectOperatingHours({ commit, state }) {
    try {
      const res = await api.fetch(`/projects/${state.projectId}/operating-hours`, "GET");
      return res;
    } catch (e) {
      console.log(e);
    }
  },
  /**
   * Load holidays for project to api
   * @param commit
   * @param state
   * @param {any} data operating hours object to save
   */
  async loadHolidays({ commit, state }) {
    try {
      const res = await api.fetch(`/projects/${state.projectId}/holidays`, "GET");
      return res;
    } catch (e) {
      console.log(e);
    }
  },
  /**
   * Load files
   * @param commit
   * @param rootState
   */
  async loadFiles({ commit, rootState }) {
    try {
      const res = await api.fetch(`/projects/${rootState.projects.projectId}/documents`, "GET");
      commit("setDocuments", res);
      return res;
    } catch (e: any) {
      commit("setReport", {
        type: "error",
        message: e?.message,
        value: true,
      });
    }
  },
  /**
   * Upload one file, using either a single post or a multi part upload depending on the file size
   * @param commit
   * @param state
   * @param {File} files file to upload
   */
  async uploadDocument({ commit, state, dispatch }, file: File) {
    try {
      const { name, size } = file;
      const type = file.type && file.type != "" ? file.type : "text/plain";
      const FILE_CHUNK_SIZE = 10000000; // 10MB

      if (size <= FILE_CHUNK_SIZE) {
        const res = await api.fetch(`/projects/${state.projectId}/documents`, "POST", {
          name,
          size,
          content_type: type != "" ? type : "",
        });
        const formData = new FormData();
        Object.keys(res.form).forEach((key) => {
          formData.append(key, res.form[key]);
        });
        formData.append("file", file);
        await axios.post(`https://s3.${envDomain}/documents/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const NUM_CHUNKS = Math.floor(size / FILE_CHUNK_SIZE) + 1;
        let start, end, blob;

        const { upload_id, asset } = await api.fetch(
          `/projects/${state.projectId}/documents/multipart`,
          "POST",
          {
            name,
            size,
            content_type: type,
          },
        );

        const uploadPartsArray = [] as { part_number: number; etag: string }[];

        for (let index = 1; index < NUM_CHUNKS + 1; index++) {
          start = (index - 1) * FILE_CHUNK_SIZE;
          end = index * FILE_CHUNK_SIZE;
          blob = index < NUM_CHUNKS ? file.slice(start, end) : file.slice(start);

          // (1) Generate presigned URL for each part
          const getUploadUrlResp = await api.fetch(
            `/projects/${state.projectId}/documents/${asset.id}/multipart/part/${index}`,
            "PUT",
            {
              upload_id,
            },
          );

          const { url } = getUploadUrlResp as { url: string };

          // (2) Puts each file part into the storage server
          const uploadResp = await axios.put(url, blob, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          uploadPartsArray.push({
            etag: uploadResp.headers.etag,
            part_number: index,
          });
        }

        // (3) Calls the CompleteMultipartUpload endpoint in the backend server
        const completeUploadResp = await api.fetch(
          `/projects/${state.projectId}/documents/${asset.id}/multipart/complete`,
          "PUT",
          {
            parts: uploadPartsArray,
            upload_id,
          },
        );
      }
      commit("app/setReport", {
        type: "success",
        message: i18nInstance.t("uiComponents.settings.repository.uploadSuccess"),
        value: true,
      });
    } catch (err) {
      commit("app/setReport", {
        type: "error",
        message: i18nInstance.t("uiComponents.settings.repository.uploadError"),
        value: true,
      });
      console.log(err);
    } finally {
      dispatch("loadFiles");
    }
  },
};

export const projects: Module<IProjectsState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
