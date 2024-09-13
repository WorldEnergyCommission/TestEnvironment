<template>
  <CoreCard
    :class="['pa-6', theme.dark ? 'live-gradient-dark' : 'live-gradient-light']"
    elevated-card
    card-with-bg-color
  >
    <CoreCardItem>
      <template #title>
        <span class="text-h4 font-weight-bold"> Live </span>
      </template>
    </CoreCardItem>
    <CoreCardText>
      <CoreRow>
        <CoreColumn v-if="includePV" cols="12" lg="6" class="pa-4">
          <ReportField
            :title="$t('modules.report.live.pv')"
            :number="currentPV"
            unit="kW"
            icon="fa-solar-panel"
            icon-color="accent"
            :animate="false"
          />
        </CoreColumn>
        <CoreColumn v-if="includeGrid" cols="12" lg="6" class="pa-4">
          <ReportField
            :title="$t('modules.report.live.grid')"
            :number="currentGrid"
            unit="kW"
            icon="fa-plug"
            icon-color="red"
            :animate="false"
          />
        </CoreColumn>
        <CoreColumn v-if="includeBattery" cols="12" lg="6" class="pa-4">
          <ReportField
            :title="$t('modules.report.live.soc')"
            :number="currentSOC"
            unit="%"
            icon="fa-battery-three-quarters"
            icon-color="green"
            :animate="false"
          />
        </CoreColumn>
        <CoreColumn v-if="includeCharginStation" cols="12" lg="6" class="pa-4">
          <ReportField
            :title="$t('modules.report.live.cs')"
            :number="currentCS"
            unit="kW"
            icon="fa-charging-station"
            icon-color="blue"
            :animate="false"
          />
        </CoreColumn>
      </CoreRow>
    </CoreCardText>
  </CoreCard>
</template>
<script lang="ts" setup>
import { computed } from "vue";
import { useTheme } from "vuetify";
import { useStore } from "vuex";

import { RootState } from "@/store/types";
import ReportField from "@/ui/components/devices/modules/ReportModule//ReportField.vue";

const props = defineProps<{
  grid?: string[];
  pv?: string[];
  battery_soc?: string[];
  cs?: string[];
}>();

const { current: theme } = useTheme();
const store = useStore();

/** Measurements Map from Store to get current measurements */
const measurements = computed(() => {
  return (store.state as RootState).measurements.measurements;
});

/** reducer function
 * to add measruement value to acc
 * for a given measurement name */
function reduceMeasurementNames(acc: number, current: string) {
  const measurement = measurements.value.get(current);
  if (measurement && !Number.isNaN(measurement)) {
    acc += Number(measurement);
  }
  return acc;
}

const includePV = computed(() => props.pv && props.pv.length != 0);
const currentPV = computed(() => {
  if (!includePV.value) return 0;

  return props.pv?.reduce((acc, current) => reduceMeasurementNames(acc, current), 0);
});

const includeGrid = computed(() => props.grid && props.grid.length != 0);
const currentGrid = computed(() => {
  if (!includeGrid.value) return 0;

  return props.grid?.reduce((acc, current) => reduceMeasurementNames(acc, current), 0);
});

const includeBattery = computed(() => props.battery_soc && props.battery_soc.length != 0);
const currentSOC = computed(() => {
  if (!includeBattery.value) return 0;

  return (
    props.battery_soc?.reduce((acc, current) => reduceMeasurementNames(acc, current), 0) /
    props.battery_soc?.length
  );
});

const includeCharginStation = computed(() => props.cs && props.cs.length != 0);
const currentCS = computed(() => {
  if (!includeCharginStation.value) return 0;

  return (
    props.cs?.reduce((acc, current) => reduceMeasurementNames(acc, current), 0) / props.cs?.length
  );
});
</script>
<style lang="scss" scoped></style>
