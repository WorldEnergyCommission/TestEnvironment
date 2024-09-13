<template>
  <LiveCard v-if="displayLiveCard" :grid="live.grid" :pv="live.pv" class="h-100" />
</template>
<script lang="ts" setup>
import { fetchEventSource } from "@microsoft/fetch-event-source";
import {
  defineProps,
  withDefaults,
  onMounted,
  watch,
  computed,
  ref,
  Ref,
  onBeforeUnmount,
} from "vue";
import { useStore } from "vuex";

import { IProject } from "@/store/modules/projects/types";
import { RootState } from "@/store/types";
import {
  useBenchmarkLiveData,
  BenchmarkChartDataDataType,
} from "@/ui/components/devices/modules/ReportModule";
import LiveCard from "@/ui/components/devices/modules/ReportModule/Cards/LiveCard.vue";
import { envApi } from "@/utils/env";

const props = withDefaults(
  defineProps<{
    selectedProjects: IProject[];
    benchmarkData: BenchmarkChartDataDataType;
  }>(),
  {
    selectedProjects: () => [] as IProject[],
  },
);

const live = useBenchmarkLiveData(props.benchmarkData);

const displayPV = computed(() => live.value.pv && live.value.pv.length > 0);
const displayGrid = computed(() => live.value.grid && live.value.grid.length > 0);
const displayBattery = computed(() => live.value.battery_soc && live.value.battery_soc.length > 0);

const displayLiveCard = computed(
  () => displayPV.value || displayGrid.value || displayBattery.value,
);

const store = useStore();
const appState = computed(() => {
  return (store.state as RootState).app;
});

const abortSSEController = ref(null) as Ref<AbortController | null>;

watch(
  () => props.selectedProjects.map((project) => project.id),
  async () => {
    await subscribeToSSE();
  },
);
watch(
  () => appState.value.auth.accessToken,
  async () => {
    await subscribeToSSE();
  },
);
onMounted(async () => {
  await subscribeToSSE();
});
onBeforeUnmount(abortSSE);

function abortSSE() {
  abortSSEController.value && abortSSEController.value.abort();
}

async function subscribeToSSE() {
  abortSSEController.value && abortSSEController.value.abort();
  const selectedIDs = props.selectedProjects.map((project) => project.id);
  if (selectedIDs.length < 1) return;
  abortSSEController.value = new AbortController();
  fetchEventSource(
    `${envApi}/measurements/subscribe/multiple?token=${appState.value.auth.accessToken}`,
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${appState.value.auth.accessToken}`,
      },
      body: JSON.stringify(selectedIDs),
      onmessage(msg) {
        if (msg.event === "mqtt") {
          const records = JSON.parse(msg.data) as any[];
          records.forEach((record) => store.commit("measurements/setMeasurement", record));
        }
      },
      signal: abortSSEController.value.signal,
    },
  );
}
</script>
