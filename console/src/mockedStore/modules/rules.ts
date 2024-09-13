export const rules = {
  namespaced: true,
  state: {
    rulesFilter: "",
  },
  getters: {
    setRulesFilter(name: string) {
      console.log("setRulesFilter", name);
    },
    getFilteredRulesSortedByDate() {
      return [
        {
          name: "Rule",
          active: true,
        },
      ];
    },
  },
  actions: {
    addRules() {
      console.log("addRules");
      return Promise.resolve();
    },
    deleteRule() {
      console.log("deleteRule");
      return Promise.resolve();
    },
    loadRules() {
      console.log("loadRules");
      return Promise.resolve([
        {
          name: "Rule",
          active: true,
        },
      ]);
    },
  },
};
