<template>
  <CoreCard class="pa-6" elevated-card card-with-bg-color>
    <CoreCardText class="h-100">
      <CoreRow>
        <CoreColumn
          cols="12"
          md="2"
          :class="`d-flex ${mdAndUp ? 'flex-column' : 'flex-row'} justify-space-between`"
        >
          <span class="text-h4 font-weight-bold"> {{ $t("modules.report.week") }} </span>
          <div v-if="overallAutarchy" :class="['text-accent-darken-1', mobile && 'mt-3']">
            <span class="text-h4"> {{ overallAutarchy }}</span>
            <span :class="!mobile && 'text-h4'"> % </span>
            <br v-if="!mobile" />
            {{ $t("modules.report.autarchy_score") }}
          </div>
        </CoreColumn>
        <CoreColumn cols="12" md="10" :class="mobile ? 'pa-0 w-100' : ''">
          <div :style="['min-height: 250px;', mobile && 'margin-inline: -0.55rem;']">
            <Chart :data="data" :titles="titles" :types="types" :y-axisis="axisis" :units="units" />
          </div>
        </CoreColumn>
      </CoreRow>
    </CoreCardText>
  </CoreCard>
</template>
<script lang="ts" setup>
import { watchEffect, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme, useDisplay } from "vuetify";

import Chart from "@/ui/components/devices/modules/ReportModule/Chart.vue";

const { t } = useI18n();
const props = defineProps<{
  pv?: Record<string, number>;
  autarchy?: Record<string, number>;
  grid_consumption?: Record<string, number>;
  grid_feed_in?: Record<string, number>;
  overallAutarchy?: number;
}>();

const data = ref<Record<string, number>[]>([]);
const titles = ref<string[]>([]);
const types = ref<string[]>([]);
const axisis = ref<string[]>([]);
const units = ref<string[]>([]);

watchEffect(() => {
  let data_arr = [] as Record<string, number>[];
  let titles_arr = [] as string[];
  let types_arr = [] as string[];
  let axisis_arr = [] as string[];
  let units_arr = [] as string[];

  if (props.grid_consumption) {
    data_arr = [...data_arr, props.grid_consumption];
    titles_arr = [...titles_arr, t("modules.report.chart.grid_consumption")];
    types_arr = [...types_arr, "bar"];
    axisis_arr = [...axisis_arr, "1"];
    units_arr = [...units_arr, "kWh"];
  }
  if (props.grid_feed_in) {
    data_arr = [...data_arr, props.grid_feed_in];
    titles_arr = [...titles_arr, t("modules.report.chart.grid_production")];
    types_arr = [...types_arr, "bar"];
    axisis_arr = [...axisis_arr, "1"];
    units_arr = [...units_arr, "kWh"];
  }
  if (props.pv) {
    data_arr = [...data_arr, props.pv];
    titles_arr = [...titles_arr, t("modules.report.chart.pv")];
    types_arr = [...types_arr, "bar"];
    axisis_arr = [...axisis_arr, "1"];
    units_arr = [...units_arr, "kWh"];
  }
  if (props.autarchy) {
    data_arr = [...data_arr, props.autarchy];
    titles_arr = [...titles_arr, t("modules.report.chart.autarchy")];
    types_arr = [...types_arr, "line"];
    axisis_arr = [...axisis_arr, "2"];
    units_arr = [...units_arr, "%"];
  }

  data.value = data_arr;
  titles.value = titles_arr;
  types.value = types_arr;
  axisis.value = axisis_arr;
  units.value = units_arr;
});

const { current: theme } = useTheme();
const { mobile, mdAndUp } = useDisplay();
</script>
