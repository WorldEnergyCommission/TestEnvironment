<template>
  <TodayCard
    v-if="displayTodayCard"
    :pv="today.pv"
    :trees_planted="today.trees_planted"
    :co2_saved="today.co2_saved"
    :coal_saved="today.coal_saved"
    :grid_consumption="today.grid_consumption"
    :grid_feed_in="today.grid_feed_in"
  />
</template>
<script setup lang="ts">
import { computed } from "vue";

import {
  BenchmarkChartDataDataType,
  useBenchmarkTodayData,
} from "@/ui/components/devices/modules/ReportModule";
import TodayCard from "@/ui/components/devices/modules/ReportModule/Cards/TodayCard.vue";

const props = defineProps<{
  benchmarkData: BenchmarkChartDataDataType;
}>();

const today = useBenchmarkTodayData(props.benchmarkData);

const displayTodayCard = computed(
  () =>
    today.value.pv ||
    today.value.trees_planted ||
    today.value.co2_saved ||
    today.value.coal_saved ||
    today.value.grid_consumption ||
    today.value.grid_feed_in ||
    today.value.electricity_cost ||
    today.value.electricity_earnings,
);
</script>
