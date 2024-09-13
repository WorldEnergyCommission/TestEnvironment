<template>
  <CoreCard class="pa-6" elevated-card card-with-bg-color>
    <CoreCardItem>
      <template #title>
        <span class="text-h4 font-weight-bold"> {{ $t("modules.report.today") }} </span>
      </template>
    </CoreCardItem>
    <CoreCardText class="h-100">
      <CoreRow>
        <CoreColumn v-if="pv" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.pv')"
            :number="pv"
            unit="kWh"
            icon="fa-solar-panel"
            icon-color="accent"
          />
        </CoreColumn>
        <CoreColumn v-if="pv && grid_feed_in" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.grid_production')"
            :number="grid_feed_in"
            unit="kWh"
            icon="fa-bolt"
            icon-color="light-blue"
          />
        </CoreColumn>
        <CoreColumn v-if="grid_consumption" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.grid_consumption')"
            :number="grid_consumption"
            unit="kWh"
            icon="fa-plug"
            icon-color="red"
          />
        </CoreColumn>
        <CoreColumn v-if="trees_planted" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.trees')"
            :number="trees_planted"
            icon="fa-seedling"
            icon-color="green"
          />
        </CoreColumn>
        <CoreColumn v-if="co2_saved" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.co2')"
            :number="co2_saved"
            unit="kg"
            icon="fa-industry"
            icon-color="lime-darken-4"
          />
        </CoreColumn>
        <CoreColumn v-if="coal_saved" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.coal')"
            :number="coal_saved"
            unit="kg"
            icon="fa-fire"
            icon-color="brown-lighten-1"
          />
        </CoreColumn>
        <CoreColumn v-if="electricity_cost" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.electricity_cost')"
            :number="electricity_cost"
            unit="€"
            icon="fa-euro-sign"
            icon-color="purple-darken-2"
          />
        </CoreColumn>
        <CoreColumn v-if="electricity_earnings" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.electricity_earnings')"
            :number="electricity_earnings"
            unit="€"
            icon="fa-hand-holding-dollar"
            icon-color="green-lighten-1"
          />
        </CoreColumn>
        <CoreColumn v-if="cs" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.cs_energy')"
            :number="cs"
            unit="kWh"
            icon="fa-charging-station"
            icon-color="blue"
          />
        </CoreColumn>
        <CoreColumn v-if="cs_state_cycles" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.cs_cycles')"
            :number="cs_state_cycles"
            unit=""
            icon="fa-charging-station"
            icon-color="purple"
          />
        </CoreColumn>
        <CoreColumn v-if="cs_earnings" cols="12" md="6" lg="4" class="pa-4">
          <ReportField
            :title="$t('modules.report.daily.cs_earnings')"
            :number="cs_earnings"
            unit="€"
            icon="fa-charging-station"
            icon-color="green-lighten-1"
          />
        </CoreColumn>
      </CoreRow>
    </CoreCardText>
  </CoreCard>
</template>
<script lang="ts" setup>
import { useTheme } from "vuetify";

import ReportField from "@/ui/components/devices/modules/ReportModule//ReportField.vue";

const { current: theme } = useTheme();

const props = defineProps<{
  pv?: number;
  trees_planted?: number;
  co2_saved?: number;
  coal_saved?: number;
  grid_consumption?: number;
  grid_feed_in?: number;
  electricity_cost?: number;
  electricity_earnings?: number;
  cs?: number;
  cs_state_cycles?: number;
  cs_earnings?: number;
}>();
</script>
