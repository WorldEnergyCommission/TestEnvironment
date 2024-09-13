<template>
  <CoreRow v-if="!isFetching">
    <CoreColumn cols="12">
      <BenchmarkingProjectOverviewCard
        v-if="selectedProjects && selectedProjects.length > 0"
        class="w-100"
        :selected-projects="selectedProjects"
      />
    </CoreColumn>
    <CoreColumn cols="12" md="5">
      <BenchmarkingLiveCard
        class="w-100"
        :selected-projects="selectedProjects"
        :benchmark-data="data"
      />
    </CoreColumn>
    <CoreColumn cols="12" md="7">
      <BenchmarkingTodayCard class="w-100" :benchmark-data="data" />
    </CoreColumn>
    <CoreColumn cols="12">
      <BenchmarkingWeekCard class="w-100" :benchmark-data="data" />
    </CoreColumn>
  </CoreRow>
  <CoreRow v-else class="w-100 h-100 d-flex align-center justify-center pa-9">
    <CircleSpinner :size="80" color="accent" />
  </CoreRow>
</template>
<script setup lang="ts">
import { defineProps, withDefaults, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";

import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import BenchmarkingLiveCard from "@/ui/components/devices/modules/Benchmarking/BenchmarkingLiveCard.vue";
import BenchmarkingProjectOverviewCard from "@/ui/components/devices/modules/Benchmarking/BenchmarkingProjectOverviewCard.vue";
import BenchmarkingTodayCard from "@/ui/components/devices/modules/Benchmarking/BenchmarkingTodayCard.vue";
import BenchmarkingWeekCard from "@/ui/components/devices/modules/Benchmarking/BenchmarkingWeekCard.vue";
import { useBenchmarkProjects } from "@/ui/components/devices/modules/ReportModule";

const props = withDefaults(
  defineProps<{
    projectIds: string[];
  }>(),
  {
    projectIds: () => [] as string[],
  },
);

const { projects, selectedProjects, data, fetchData, isFetching } = useBenchmarkProjects();

watch(props.projectIds, updateAndFetch);
watch(projects, updateAndFetch);
onMounted(updateAndFetch);

function updateAndFetch() {
  selectedProjects.value =
    props.projectIds.length > 0
      ? projects.value.filter((project) => props.projectIds.includes(project.id))
      : projects.value;
  fetchData();
}
const { t } = useI18n();
</script>
