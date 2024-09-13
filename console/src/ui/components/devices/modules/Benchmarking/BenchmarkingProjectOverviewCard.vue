<template>
  <CoreCard
    :class="['pa-6', theme.dark ? 'live-gradient-dark' : 'live-gradient-light']"
    elevated-card
    card-with-bg-color
  >
    <CoreCardItem>
      <template #title>
        <span class="text-h4 font-weight-bold"> Projekte </span>
      </template>
    </CoreCardItem>
    <CoreCardText>
      <CoreRow>
        <CoreColumn cols="12" md="6">
          <CoreRow>
            <CoreColumn cols="12" md="6" class="pa-4">
              <ReportField
                title="Projekte"
                :number="selectedProjects.length"
                unit=""
                icon="fa-bolt"
                icon-color="accent"
                :animate="false"
              />
            </CoreColumn>
            <CoreColumn cols="12" md="6" class="pa-4">
              <ReportField
                :title="t('uiComponents.map.ok')"
                :number="projectsWithOutWarnings.length"
                unit=""
                icon="fa-check"
                icon-color="green"
                :animate="false"
              >
                <CoreButton
                  style="right: -1rem; top: -1rem"
                  icon
                  :to="{ path: '/', query: { projectState: 'ok' } }"
                >
                  <CoreCardSubtitle class="d-flex align-center flex-column-reverse">
                    <CoreIcon> fas fa-up-right-from-square</CoreIcon>
                  </CoreCardSubtitle>
                </CoreButton>
              </ReportField>
            </CoreColumn>
            <CoreColumn cols="12" md="6" class="pa-4">
              <ReportField
                :title="t('uiComponents.map.error')"
                :number="projectsWithErrors.length"
                unit=""
                icon="fault"
                icon-color="red"
                :animate="false"
              >
                <CoreButton
                  style="right: -1rem; top: -1rem"
                  icon
                  :to="{ path: '/', query: { projectState: 'error' } }"
                >
                  <CoreCardSubtitle class="d-flex align-center flex-column-reverse">
                    <CoreIcon> fas fa-up-right-from-square</CoreIcon>
                  </CoreCardSubtitle>
                </CoreButton>
              </ReportField>
            </CoreColumn>
            <CoreColumn cols="12" md="6" class="pa-4">
              <ReportField
                :title="t('uiComponents.map.warning')"
                :number="projectsWithWarnings.length"
                unit=""
                icon="warning"
                icon-color="warning"
                :animate="false"
              >
                <CoreButton
                  style="right: -1rem; top: -1rem"
                  icon
                  :to="{ path: '/', query: { projectState: 'warning' } }"
                >
                  <CoreCardSubtitle class="d-flex align-center flex-column-reverse">
                    <CoreIcon> fas fa-up-right-from-square</CoreIcon>
                  </CoreCardSubtitle>
                </CoreButton>
              </ReportField>
            </CoreColumn>
          </CoreRow>
        </CoreColumn>
        <CoreColumn cols="12" md="6" class="h-100">
          <CoreRow class="h-100">
            <CoreColumn cols="12" class="pa-4 pb-0 h-100">
              <CoreCard class="w-100 h-100" variant="tonal" style="overflow: visible">
                <CoreCardItem>
                  <CoreContainer>
                    <CoreList v-if="alerts?.length ?? 0 > 0" class="rounded">
                      <CoreListItem
                        v-for="(alert, index) in alerts"
                        :key="alert.id"
                        :to="alert.project_id && `/projects/${alert.project_id}/eventlist`"
                      >
                        <CoreListItemSubtitle>
                          {{ alert.project_id ? nameOfProject(alert.project_id) : "-" }}
                        </CoreListItemSubtitle>
                        <CoreListItemTitle>
                          {{ alert.body }}
                        </CoreListItemTitle>
                        <template #append>
                          <CoreIcon> fas fa-up-right-from-square</CoreIcon>
                        </template>
                        <CoreDivider v-if="index != alerts.length - 1" />
                      </CoreListItem>
                    </CoreList>
                    <CoreSheet v-else class="pa-3 rounded">
                      {{ t("uiComponents.eventListTable.nothingToAccept") }}
                    </CoreSheet>

                    <CoreSheet
                      style="
                        width: 50px;
                        height: 50px;
                        left: -25px;
                        top: 10px;
                        position: absolute;
                        box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.25);
                        border-radius: 9999px;
                        z-index: 1;
                      "
                      class="d-flex align-center justify-center"
                      variant="elevated"
                    >
                      <lynus-icon :color="'accent'" name="fa-list" />
                    </CoreSheet>
                  </CoreContainer>
                </CoreCardItem>
              </CoreCard>
            </CoreColumn>
          </CoreRow>
        </CoreColumn>
      </CoreRow>
      <!-- <CoreColumn cols="12" md="6"> </CoreColumn> -->
    </CoreCardText>
  </CoreCard>
</template>
<script lang="ts" setup>
import { defineProps, withDefaults, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "vuetify";
import { useStore } from "vuex";

import { IProject } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import { useAlertSummary } from "@/ui/components/devices/modules/Benchmarking";
import ReportField from "@/ui/components/devices/modules/ReportModule//ReportField.vue";
import { projects } from "@/store/modules/projects";

const props = withDefaults(
  defineProps<{
    selectedProjects: IProject[];
  }>(),
  {
    selectedProjects: () => [] as IProject[],
  },
);

const { t } = useI18n();
const { current: theme } = useTheme();
const store = useStore();
const appState = computed(() => {
  return (store.state as RootState).app;
});

const projectsWithErrors = computed(() => {
  return props.selectedProjects.filter((project: IProject) => {
    return project.stats.errors;
  });
});

const projectsWithWarnings = computed(() => {
  return props.selectedProjects.filter((project: IProject) => {
    return project.stats.warnings && !project.stats.errors;
  });
});
const projectsWithOutWarnings = computed(() => {
  return props.selectedProjects.filter((project: IProject) => {
    return !project.stats.warnings && !project.stats.errors;
  });
});
const { alertSummary: alerts, fetchAlertSummary } = useAlertSummary();

function nameOfProject(id: string) {
  return props.selectedProjects.find((project) => project.id === id)?.name;
}
</script>
