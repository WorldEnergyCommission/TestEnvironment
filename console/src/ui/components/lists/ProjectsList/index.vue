<template>
  <div ref="container" class="project-list" style="padding: 10px">
    <CoreRow class="d-flex" dense>
      <CoreColumn cols="12" md="3" :class="['sort', { 'mt-0': $vuetify.display.mobile }]" order="0">
        <Search ref="search" class="mr-2 w-100" />
      </CoreColumn>
      <CoreSpacer v-if="!$vuetify.display.mobile" class="flex-grow-1" order="1" />
      <CoreColumn
        cols="12"
        order-md="2"
        order="3"
        md="3"
        lg="2"
        sm="4"
        :class="[
          'sort d-flex',
          { 'flex-row-reverse': !$vuetify.display.mobile },
          { 'align-center': $vuetify.display.mobile },
          { 'mt-0': $vuetify.display.mobile },
        ]"
      >
        <CoreButtonToggle
          v-model="selectStates"
          variant="outlined"
          multiple
          :label="t('uiComponents.sort.project_status')"
          :dense="$vuetify.display.mobile"
        >
          <!-- <template #item="{ props, item }">
            <CoreListItem v-bind="props">
              <template #append>
                <lynus-icon
                  :color="item.raw.color"
                  :name="item.raw.icon"
                  style="margin-left: auto; margin-right: 0px"
                />
              </template>
            </CoreListItem>
          </template>
          <template #selection="{ item }">
            <CoreChip :color="item.raw.color">
              <span>{{ item.title }}</span>
            </CoreChip>
          </template> -->
          <CoreButton
            v-for="state in filterStates"
            :key="state.value"
            :value="state.value"
            button-type="primary"
          >
            <CoreTooltip location="bottom">
              <template #activator="{ props: activatorProps }">
                <lynus-icon
                  :color="state.color"
                  :name="state.icon"
                  style="margin-left: auto; margin-right: 0px"
                  v-bind="activatorProps"
                />
              </template>
              <span>{{ state.title }}</span>
            </CoreTooltip>
          </CoreButton>
        </CoreButtonToggle>
      </CoreColumn>
      <CoreColumn
        cols="12"
        md="3"
        order-md="3"
        order="2"
        :class="['sort', { 'mt-0': $vuetify.display.mobile }]"
      >
        <CoreSelect
          v-model="sortByKey"
          :items="sortByItems"
          :label="$t('uiComponents.sort.title')"
          hide-details
          hide-selected
          item-title="key"
          item-value="value"
          density="compact"
          rounded
        />
        <CoreButton button-type="standardIcon" @click="changeSortByOrder">
          <CoreIcon>
            {{ sortByOrder === SortByOrder.desc ? "fas fa-arrow-down" : "fas fa-arrow-up" }}
          </CoreIcon>
        </CoreButton>
      </CoreColumn>
    </CoreRow>
    <RecycleScroller
      v-slot="{ item }"
      :items="sortedAndFilteredProjects"
      :item-size="itemHeight + 20"
      :item-secondary-size="itemWidth"
      :grid-items="numOfItemsInRow"
    >
      <div style="margin: 10px">
        <ProjectItem :height="itemHeight" :project="item" />
      </div>
    </RecycleScroller>
  </div>
</template>

<script lang="ts" setup>
import { useElementSize } from "@vueuse/core";
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { RecycleScroller } from "vue-virtual-scroller";
import { useDisplay } from "vuetify";
import { useStore } from "vuex";
import "vue-virtual-scroller/dist/vue-virtual-scroller.css";

import { SortBy, SortByKey, SortByOrder } from "./Sort";
import { IProject } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import ProjectItem from "@/ui/components/lists/ProjectsList/ProjectItem.vue";
import Search from "@/ui/components/components/Search.vue";

/**
 * Component that represent all projects in a virtual list
 * Used in Home page.
 */

const { t } = useI18n();
const store = useStore();

const display = useDisplay();

const container = ref(null);
const { width } = useElementSize(container);
const reloadStats = ref<NodeJS.Timeout>();
const { push } = useRouter();
const route = useRoute();

const sortByKey = computed({
  // getter
  get() {
    return route.query.sortByKey || SortByKey.name;
  },
  // setter
  set(newValue) {
    // Note: we are using destructuring assignment syntax here.
    push({
      query: {
        ...route.query,
        sortByKey: newValue,
      },
    });
  },
});

const sortByOrder = computed({
  // getter
  get() {
    return route.query.sortByOrder || SortByOrder.asc;
  },
  // setter
  set(newValue) {
    // Note: we are using destructuring assignment syntax here.
    push({
      query: {
        ...route.query,
        sortByOrder: newValue,
      },
    });
  },
});
const selectStates = computed({
  // getter
  get() {
    return route.query.projectState || [];
  },
  // setter
  set(newValue) {
    // Note: we are using destructuring assignment syntax here.
    push({
      query: {
        ...route.query,
        projectState: newValue,
      },
    });
  },
});

const sortByItems = computed(() => {
  return [
    { key: t("uiComponents.sort.name"), value: SortByKey.name },
    { key: t("uiComponents.sort.createdAt"), value: SortByKey.createdAt },
    { key: t("uiComponents.sort.last_connection"), value: SortByKey.last_connection },
    { key: t("uiComponents.sort.number_of_devices"), value: SortByKey.number_of_devices },
  ];
});

const filterStates = computed(() => [
  { title: t("uiComponents.map.ok"), value: "ok", color: "green", icon: "ok" },
  { title: t("uiComponents.map.warning"), value: "warning", color: "warning", icon: "warning" },
  { title: t("uiComponents.map.error"), value: "error", color: "red", icon: "fault" },
]);

/**
 * Sort and filter projects by projectFilter
 * @return {array} projects list
 */
const sortedAndFilteredProjects = computed(() => {
  let list = projects.value
    .filter((project: any) => {
      if (projectFilter.value && projectFilter.value.length) {
        const projectName = project.name.toLowerCase();
        let projectInfos = "";

        if (project.meta.hardwareId) {
          const projectHardwareId = project.meta.hardwareId.toLowerCase();
          projectInfos = projectName + projectHardwareId;
        } else {
          projectInfos = projectName;
        }

        return projectInfos.includes(projectFilter.value.toLowerCase());
      }
      return project;
    })
    .filter((project: any) => {
      const state =
        project.stats?.errors > 0 ? "error" : project.stats?.warnings > 0 ? "warning" : "ok";
      if (selectStates.value && selectStates.value.length) {
        return selectStates.value.includes(state);
      }
      return project;
    })
    .sort(sort);

  if (sortByOrder.value === SortByOrder.desc) {
    list = list.reverse();
  }

  return list;
});
const projectFilter = computed(() => {
  return (store.state as RootState).projects.projectsFilter;
});
const itemHeight = computed(() => {
  if (display.mdAndDown.value) {
    return 140;
  }

  if (display.xs.value || display.sm.value) {
    return 245;
  }

  return 365;
});

const itemWidth = computed(() => {
  return width.value / numOfItemsInRow.value;
});
const numOfItemsInRow = computed(() => {
  switch (display.name.value) {
    case "xs":
      return 1;
    case "sm":
      return 2;
    case "md":
      return 3;
    case "lg":
      return 4;
    case "xl":
      return 4;
    case "xxl":
      return 4;
  }
  return 4;
});
const projects = computed(() => {
  return store.getters["projects/projects"];
});

/**
 * Sort projects by different attributes in ascending order
 */
function sort(a: IProject, b: IProject) {
  switch (sortByKey.value) {
    case SortByKey.name:
      return a.name.localeCompare(b.name);
    case SortByKey.createdAt:
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    case SortByKey.last_connection:
      return new Date(a.connectivity?.last).getTime() - new Date(b.connectivity?.last).getTime();
    case SortByKey.number_of_devices:
      return a.stats?.devices - b.stats?.devices;
  }
}
function changeSortByOrder() {
  if (sortByOrder.value === SortByOrder.desc) {
    sortByOrder.value = SortByOrder.asc;
  } else {
    sortByOrder.value = SortByOrder.desc;
  }
}
/**
 * Updates projects every 60 seconds
 */
function statsInterval() {
  reloadStats.value = setInterval(() => {
    store.dispatch("projects/loadProjects");
  }, 60000);
}

onMounted(() => {
  statsInterval();
});
onBeforeUnmount(() => {
  clearInterval(reloadStats.value);
});
</script>

<style lang="scss" scoped>
.project-list {
  width: calc(100% + 40px);
  margin-left: -20px;
}

.sort {
  display: flex;
  align-items: center;
  margin: 10px;
}
</style>
