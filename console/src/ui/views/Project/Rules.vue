<template>
  <div class="project-rules curved-display-margin-bottom">
    <CoreExpansionPanels variant="inset">
      <CoreExpansionPanel v-for="(rule, ruleIndex) in rules" :key="ruleIndex">
        <CoreExpansionPanelTitle>
          <div class="rule-header-name flex-rule-1">
            {{ rule.name }}
          </div>
          <div
            :class="[
              'rule-header-status',
              { 'active-rule-header-status': rule.active },
              'ml-auto',
              'mr-3',
              'text-center',
            ]"
          >
            {{ rule.active ? $t("uiComponents.rules.active") : $t("uiComponents.rules.notActive") }}
          </div>
        </CoreExpansionPanelTitle>
        <CoreExpansionPanelText>
          <RuleForm :rule="rule" />
        </CoreExpansionPanelText>
      </CoreExpansionPanel>
    </CoreExpansionPanels>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useStore } from "vuex";

import { IProject } from "@/store/modules/projects/types";
import { IRule } from "@/store/modules/rules/types";
import { RootState } from "@/store/types";
import RuleForm from "@/ui/components/forms/Rules/RuleForm.vue";

// Constants
const store = useStore();

// Computed Properties
const rules = computed(() => {
  return getFilteredRulesSortedByDate.value;
});

const getFilteredRulesSortedByDate = computed(() => {
  return store.getters["rules/getFilteredRulesSortedByDate"];
});

const project = computed<IProject>(() => {
  return (store.state as RootState).projects.project;
});

// Functions
function loadRules(project_id: string): Promise<IRule[]> {
  return store.dispatch("rules/loadRules", project_id);
}

// Lifecycle Hook
onMounted(async () => {
  await loadRules(project.value!.id);
});
</script>

<style lang="scss">
.project-rules {
  .rule-header-name {
    width: 20%;
  }

  .rule-header-status {
    color: red;
  }

  .active-rule-header-status {
    color: green;
  }
}
</style>
