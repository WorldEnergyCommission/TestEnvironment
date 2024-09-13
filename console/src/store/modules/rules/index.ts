import { Map } from "immutable";
import { ActionTree, GetterTree, Module, MutationTree } from "vuex";

import api from "@/store/api";
import {
  DeleteRulePayload,
  IRule,
  IRulesState,
  ModifyRulePayload,
} from "@/store/modules/rules/types";
import { RootState } from "@/store/types";
import { i18nInstance } from "@/ui/plugins/i18n";

const state: IRulesState = {
  rules: Map(),
  rulesFilter: "",
};

const getters: GetterTree<IRulesState, RootState> = {
  getRules: (state: IRulesState) => state.rules,

  getFilteredRules: (state: IRulesState) =>
    [...state.rules]
      .filter(([_key, rule]) => rule.name.toLowerCase().includes(state.rulesFilter.toLowerCase()))
      .map(([k, v]) => v),

  getFilteredRulesSortedByDate: (_state: IRulesState, getters) => {
    const copy: IRule[] = [...getters.getFilteredRules];
    copy.sort((a: IRule, b: IRule) => {
      const first = new Date(a.created_at).getTime();
      const second = new Date(b.created_at).getTime();
      return first >= second ? 1 : -1;
    });
    return copy;
  },
  findRuleById: (state: IRulesState) => (id: string) => state.rules.get(id),
};

const mutations: MutationTree<IRulesState> = {
  setRules(state: IRulesState, rules: Map<string, IRule>) {
    state.rules = rules;
  },
  setRule(state: IRulesState, rule: IRule) {
    state.rules.set(rule.id, rule);
  },
  setRulesFilter(state: IRulesState, name: string) {
    state.rulesFilter = name;
  },
};

const actions: ActionTree<IRulesState, RootState> = {
  /**
   * Load project rules
   * @param commit
   * @param projectId project id
   */
  async loadRules({ commit }, projectId) {
    const result = await api.fetch(`/projects/${projectId}/rules`, "GET");
    const rules = (result as IRule[]).reduce(
      (acc, current) => acc.set(current.id, current),
      Map<string, IRule>(),
    );
    commit("setRules", rules);
    return rules;
  },

  /**
   * Create new rule
   * @param commit
   * @param payLoad rule data
   */
  async addRule({ commit }, payLoad: any) {
    const res = await api.fetch(`/projects/${payLoad.id}/rules`, "POST", payLoad.ruleModel);
    commit("setRule", res);
    commit(
      "app/setReport",
      {
        type: "success",
        message: i18nInstance.t("uiComponents.rules.ruleCreated"),
        value: true,
      },
      { root: true },
    );
    return res;
  },

  /**
   * Create new rules list
   * @param commit
   * @param project_id
   * @param rulesList rules list
   */
  async addRules({ commit }, payload: { project_id: string; rulesList: IRule[] }) {
    const res = await api.fetch(`/projects/${payload.project_id}/rules`, "POST", payload.rulesList);
    const rules = payload.rulesList.reduce(
      (acc, current) => acc.set(current.id, current),
      Map<string, IRule>(),
    );
    commit("setRules", rules);

    return res;
  },

  /**
   * Update selected rule
   * @param commit
   * @param payload rule data
   */
  async modifyRule({ commit }, payload: ModifyRulePayload) {
    await api.fetch(
      `/projects/${payload.project_id}/rules/${payload.rule.id}`,
      "PUT",
      payload.rule,
    );
    commit("setRules", state.rules.set(payload.rule.id, payload.rule));
    commit(
      "app/setReport",
      {
        type: "success",
        message: i18nInstance.t("uiComponents.rules.ruleUpdated"),
        value: true,
      },
      { root: true },
    );
  },

  /**
   * Delete selected rule
   * @param commit
   * @param state
   * @param project_id project id
   * @param rule_id rule id
   */
  async deleteRule({ commit, state }, payload: DeleteRulePayload) {
    await api.fetch(`/projects/${payload.project_id}/rules/${payload.rule_id}`, "DELETE");
    commit("setRules", state.rules.delete(payload.rule_id));
    commit(
      "app/setReport",
      {
        type: "success",
        message: i18nInstance.t("uiComponents.rules.ruleDeleted"),
        value: true,
      },
      { root: true },
    );
  },
};

export const rules: Module<IRulesState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
};
