<template>
  <WeekCard
    v-if="displayWeekCard"
    :pv="week?.pv"
    :grid_consumption="week?.grid_consumption"
    :grid_feed_in="week?.grid_feed_in"
  />
</template>
<script setup lang="ts">
import { computed } from "vue";

import {
  useBenchmarkWeekData,
  BenchmarkChartDataDataType,
} from "@/ui/components/devices/modules/ReportModule";
import WeekCard from "@/ui/components/devices/modules/ReportModule/Cards/WeekCard.vue";

const props = defineProps<{
  benchmarkData: BenchmarkChartDataDataType;
}>();

const week = useBenchmarkWeekData(props.benchmarkData);

const displayWeekCard = computed(
  () =>
    (week.value.pv && Object.entries(week.value.pv).length > 0) ||
    (week.value.grid_consumption && Object.entries(week.value.grid_consumption).length > 0) ||
    (week.value.grid_feed_in && Object.entries(week.value.grid_feed_in).length > 0),
);
</script>
