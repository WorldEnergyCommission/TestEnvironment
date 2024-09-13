<template xmlns:v-slot="http://www.w3.org/1999/XSL/Transform">
  <div class="search">
    <CoreTextField
      v-if="$route.meta?.searchByProjects"
      ref="searchByProjects"
      v-model="projectSearch"
      :clearable="true"
      :placeholder="searchPlaceholderLang"
      clear-icon="fa-solid fa-xmark"
      hide-details
    >
      <template #prepend-inner>
        <CoreIcon size="x-small"> fas fa-search </CoreIcon>
      </template>
    </CoreTextField>
    <CoreTextField
      v-if="$route.meta?.searchByDevices"
      ref="searchByDevices"
      v-model="devicesSearch"
      :clearable="true"
      :placeholder="searchPlaceholderLang"
      clear-icon="fa-solid fa-xmark"
      hide-details
    >
      <template #prepend-inner>
        <CoreIcon class="pr-2" size="x-small"> fas fa-search </CoreIcon>
      </template>
    </CoreTextField>
    <CoreTextField
      v-if="$route.meta?.searchByMeasurements"
      ref="searchByMeasurements"
      v-model="measurementsSearch"
      :clearable="true"
      :placeholder="searchPlaceholderLang"
      clear-icon="fa-solid fa-xmark"
      hide-details
    >
      <template #prepend-inner>
        <CoreIcon class="pr-2" size="x-small"> fas fa-search </CoreIcon>
      </template>
    </CoreTextField>
    <CoreTextField
      v-if="$route.meta?.searchByEventList"
      ref="searchByEventList"
      v-model="eventListSearch"
      :clearable="true"
      :placeholder="searchPlaceholderLang"
      clear-icon="fa-solid fa-xmark"
      hide-details
    >
      <template #prepend-inner>
        <CoreIcon class="pr-2" size="x-small"> fas fa-search </CoreIcon>
      </template>
    </CoreTextField>
    <CoreTextField
      v-if="$route.meta?.searchByRules"
      ref="searchByRules"
      v-model="rulesSearch"
      :clearable="true"
      :placeholder="searchPlaceholderLang"
      clear-icon="fa-solid fa-xmark"
      hide-details
    >
      <template #prepend-inner>
        <CoreIcon class="pr-2" size="x-small"> fas fa-search </CoreIcon>
      </template>
    </CoreTextField>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

import { RootState } from "@/store/types";

/**
 * Component that represent search
 * Used in AppBar.vue
 * Give possibility to filter devices, projects...
 */
export default defineComponent({
  setup() {
    const searchByProjects = ref(null);
    const searchByDevices = ref(null);
    const searchByMeasurements = ref(null);
    const searchByEventList = ref(null);
    const searchByRules = ref(null);
    return {
      searchByProjects,
      searchByDevices,
      searchByMeasurements,
      searchByEventList,
      searchByRules,
    };
  },
  computed: {
    projectsState() {
      return (this.$store.state as RootState).projects;
    },
    devicesState() {
      return (this.$store.state as RootState).devices;
    },
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    eventState() {
      return (this.$store.state as RootState).events;
    },
    rulesState() {
      return (this.$store.state as RootState).rules;
    },
    searchPlaceholderLang() {
      return this.$t("uiComponents.search.placeholder");
    },
    projectSearch: {
      get() {
        return this.projectsState.projectsFilter;
      },
      set(value: string) {
        this.setProjectFilter(value);
      },
    },
    devicesSearch: {
      get() {
        return this.devicesState.devicesFilter;
      },
      set(value: string) {
        this.setDevicesFilter(value);
      },
    },
    measurementsSearch: {
      get() {
        return this.measurementsState.measurementsFilter;
      },
      set(value: string) {
        this.setMeasurementsFilter(value);
      },
    },
    eventListSearch: {
      get() {
        return this.eventState.eventListFilter;
      },
      set(value: string) {
        this.setEventListFilter(value);
      },
    },
    rulesSearch: {
      get() {
        return this.rulesState.rulesFilter;
      },
      set(value: string) {
        this.setRulesFilter(value);
      },
    },
  },
  methods: {
    focusOnInput() {
      if (this.$route.meta?.searchByProjects) {
        ((this.searchByProjects as any).coreTextField as HTMLElement).focus();
        return;
      }
      if (this.$route.meta?.searchByDevices) {
        ((this.searchByDevices as any).coreTextField as HTMLElement).focus();
        return;
      }
      if (this.$route.meta?.searchByMeasurements) {
        ((this.searchByMeasurements as any).coreTextField as HTMLElement).focus();
        return;
      }
      if (this.$route.meta?.searchByEventList) {
        ((this.searchByEventList as any).coreTextField as HTMLElement).focus();
        return;
      }
      if (this.$route.meta?.searchByRules) {
        ((this.searchByRules as any).coreTextField as HTMLElement).focus();
      }
    },
    setProjectFilter(name: string) {
      this.$store.commit("projects/setProjectFilter", name);
    },
    setDevicesFilter(name: string) {
      this.$store.commit("devices/setDevicesFilter", name);
    },
    setMeasurementsFilter(name: string) {
      this.$store.commit("measurements/setMeasurementsFilter", name);
    },
    setEventListFilter(name: string) {
      this.$store.commit("app/setEventListFilter", name);
    },
    setRulesFilter(name: string) {
      this.$store.commit("rules/setRulesFilter", name);
    },
  },
});
</script>

<style lang="scss">
.search {
  .v-field__input {
    min-width: 170px;
    font-size: 15px;
  }

  .v-field {
    border-radius: 24px;
  }

  .v-field--prepended {
    padding-inline-start: 24px;
  }

  .v-field--variant-outlined {
    .v-field__outline__start {
      flex: 0 0 50px;
    }

    .v-field__outline__start,
    .v-field__outline__end {
      border-color: rgb(var(--v-theme-accent));
    }
  }
}
</style>
