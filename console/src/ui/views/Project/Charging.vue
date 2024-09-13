<template>
  <div class="curved-display-margin-bottom">
    <CoreRow>
      <CoreColumn cols="12" md="4">
        <CoreCard
          :class="['pa-6', theme.dark ? 'live-gradient-dark' : 'live-gradient-light']"
          elevated-card
          card-with-bg-color
        >
          <CoreCardItem>
            <template #title>
              <span class="text-h5"> Live </span>
            </template>
          </CoreCardItem>

          <CoreCardText>
            <CoreRow>
              <CoreColumn cols="12" class="pa-4">
                <ReportField
                  :title="t('modules.report.live.cs')"
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
      </CoreColumn>
      <CoreColumn cols="12" md="8">
        <CoreCard class="pa-6" elevated-card card-with-bg-color>
          <CoreCardItem>
            <template #title>
              <span class="text-h5"> {{ t("modules.report.today") }} </span>
            </template>
          </CoreCardItem>
          <CoreCardText>
            <CoreRow>
              <CoreColumn cols="12" md="4" class="pa-4">
                <ReportField
                  :title="t('modules.report.daily.cs_earnings')"
                  :number="cs_earnings_today"
                  unit="€"
                  icon="fa-charging-station"
                  icon-color="green-lighten-1"
                />
              </CoreColumn>

              <CoreColumn cols="12" md="4" class="pa-4">
                <ReportField
                  :title="t('modules.report.daily.cs_cycles')"
                  :number="cs_state_cycles_today"
                  unit=""
                  icon="fa-charging-station"
                  icon-color="purple"
                />
              </CoreColumn>
              <CoreColumn cols="12" md="4" class="pa-4">
                <ReportField
                  :title="t('modules.report.daily.cs_energy')"
                  :number="cs_today"
                  unit="kWh"
                  icon="fa-charging-station"
                  icon-color="blue"
                />
              </CoreColumn>
            </CoreRow>
          </CoreCardText>
        </CoreCard>
      </CoreColumn>

      <CoreColumn cols="12">
        <CoreCard class="pa-6" elevated-card card-with-bg-color>
          <CoreCardItem>
            <template #title>
              <span class="text-h5"> {{ t("modules.report.week") }} </span>
            </template>
          </CoreCardItem>
          <CoreCardText>
            <CoreRow>
              <CoreColumn cols="12" md="4" class="pa-4">
                <!-- <CoreCard> -->
                <ReportField
                  :title="t('modules.report.daily.cs_cycles')"
                  :number="chargingSessionsThisWeek"
                  unit=""
                  icon="fa-plug-circle-bolt"
                  :icon-color="'red'"
                  :animate="false"
                />
              </CoreColumn>
              <CoreColumn cols="12" md="4" class="pa-4">
                <ReportField
                  :title="t('modules.report.daily.cs_energy')"
                  :number="chargingEnergyThisWeek"
                  unit="kWh"
                  icon="fa-battery-full"
                  :icon-color="'green'"
                  :animate="false"
                />
              </CoreColumn>
              <CoreColumn cols="12" md="4" class="pa-4">
                <ReportField
                  :title="t('modules.charging.average_energy')"
                  :number="chargingAvgEnergyThisWeek"
                  unit="kWh"
                  icon="fa-bolt"
                  :icon-color="'blue'"
                  :animate="false"
                />
              </CoreColumn>
            </CoreRow>
          </CoreCardText>
        </CoreCard>
      </CoreColumn>
      <CoreColumn cols="12">
        <!-- Charging history chart -->
        <CoreCard class="pa-6" elevated-card card-with-bg-color>
          <CoreCardItem>
            <template #title>
              <span class="text-h5"> {{ t("modules.charging.month_overview") }}</span>
            </template>
          </CoreCardItem>

          <CoreCardText>
            <CoreRow>
              <CoreColumn cols="12">
                <CoreCard style="min-height: 15rem" class="pa-3">
                  <Chart
                    :data="data"
                    :titles="[t('modules.charging.charged_energy')]"
                    :types="['bar']"
                    :y-axisis="['1']"
                    :units="['kWh']"
                    :labels="labels"
                    :disable-separator="$vuetify.display.mobile"
                    legend-position="bottom"
                    style="min-height: 0; min-width: 0"
                  />
                </CoreCard>
              </CoreColumn>
              <CoreColumn>
                <ChartFooter
                  v-model:date="date"
                  :loading="loadingChartData"
                  :period="Periods.MONTH"
                  :format="'date'"
                />
              </CoreColumn>
            </CoreRow>
          </CoreCardText>
        </CoreCard>
      </CoreColumn>
      <CoreColumn cols="12">
        <!-- Charging session table -->
        <CoreCard class="pa-6" elevated-card card-with-bg-color>
          <CoreCardItem>
            <template #title>
              <span class="text-h5"> {{ t("modules.charging.charging_sessions") }} </span>
            </template>
          </CoreCardItem>

          <CoreCardText>
            <CoreRow>
              <CoreColumn cols="12">
                <CoreCard>
                  <CoreDataTable
                    :headers="headers"
                    :items="chargingSessions"
                    :loading="loadingReport"
                  >
                    <!-- disable pagination -->
                    <template #bottom />

                    <template #item.name="{ item }">
                      {{
                        chargingMappings.find((mapping) => mapping.id === item.station_id)?.name ??
                        "-"
                      }}
                    </template>
                    <template #item.start="{ item }">
                      {{ formatDateForChart(new Date(item.start * 1000)) }}
                    </template>
                    <template #item.end="{ item }">
                      {{ formatDateForChart(new Date(item.end * 1000)) }}
                    </template>
                    <template #item.energy="{ item }">
                      {{ Math.round(item.energy, 2) }} kWh
                    </template>

                    <!-- mobile version of total values window data table -->
                    <template v-if="$vuetify.display.mobile" #headers />
                    <template v-if="$vuetify.display.mobile" #body="{ items }">
                      <tr
                        v-for="(item, index) in items"
                        :key="index"
                        class="v-data-table__mobile-table-row"
                      >
                        <td class="v-data-table__mobile-row">
                          <div class="v-data-table__mobile-row__header">
                            {{ t("modules.charging.charging_sessions_header.wallbox") }}
                          </div>
                          <div class="v-data-table__mobile-row__cell">
                            {{
                              chargingMappings.find((mapping) => mapping.id === item.station_id)
                                ?.name ?? "-"
                            }}
                          </div>
                        </td>
                        <td class="v-data-table__mobile-row">
                          <div class="v-data-table__mobile-row__header">
                            {{ t("modules.charging.charging_sessions_header.start") }}
                          </div>
                          <div class="v-data-table__mobile-row__cell">
                            {{ formatDateForChart(new Date(item.start * 1000)) }}
                          </div>
                        </td>

                        <td class="v-data-table__mobile-row">
                          <div class="v-data-table__mobile-row__header">
                            {{ t("modules.charging.charging_sessions_header.end") }}
                          </div>
                          <div class="v-data-table__mobile-row__cell">
                            {{ formatDateForChart(new Date(item.end * 1000)) }}
                          </div>
                        </td>

                        <td class="v-data-table__mobile-row">
                          <div class="v-data-table__mobile-row__header">
                            {{ t("modules.charging.charging_sessions_header.energy") }}
                          </div>
                          <div class="v-data-table__mobile-row__cell">
                            {{ Math.round(item.energy, 2) }} kWh
                          </div>
                        </td>

                        <td class="v-data-table__mobile-row">
                          <div class="v-data-table__mobile-row__header">
                            {{ t("modules.charging.charging_sessions_header.duration") }}
                          </div>
                          <div class="v-data-table__mobile-row__cell">
                            {{ item.duration }}
                          </div>
                        </td>
                      </tr>
                    </template>
                  </CoreDataTable>
                </CoreCard>
              </CoreColumn>
              <CoreColumn>
                <ChartFooter
                  v-model:date="tableDate"
                  :loading="loadingReport"
                  :period="Periods.WEEK"
                  :format="'date'"
                />
              </CoreColumn>
            </CoreRow>
          </CoreCardText>
        </CoreCard>
      </CoreColumn>
    </CoreRow>
  </div>
</template>

<script lang="ts" setup>
import moment from "moment";
import { ref, computed, onBeforeMount, onMounted, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useTheme } from "vuetify";
import { useStore } from "vuex";

import { useIntlDate } from "@/composables/useIntlDate";
import api from "@/store/api";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import ChartFooter from "@/ui/components/devices/charts/charts/ChartFooter.vue";
import {
  useChartData,
  Periods,
  getAbsoluteBounds,
} from "@/ui/components/devices/charts/charts/ChartUtils";
import { useReportModuleData } from "@/ui/components/devices/modules/ReportModule";
import Chart from "@/ui/components/devices/modules/ReportModule/Chart.vue";
import ReportField from "@/ui/components/devices/modules/ReportModule/ReportField.vue";
import { getDateString } from "@/utils/utilsFunctions";

const { current: theme } = useTheme();
const { t } = useI18n();

const { formatDateForChart } = useIntlDate();

const labels = computed(() =>
  data.value[0]
    ? Object.keys(data.value[0]).map((key) => new Date(parseInt(key) * 1000).toLocaleDateString())
    : [],
);

const date = ref<string>(getDateString());

const store = useStore();

const chargingMappings = computed(() =>
  store.getters["dataMappings/filteredByTypeName"]("Charging Station"),
);

const power_vars = computed<string[]>(() =>
  chargingMappings.value.map((mapping) => mapping.mappings["95219913-dbda-4165-8933-cdcfdb34e4d3"]),
);

const chartData = computed(() => {
  const device = { data: {} };
  (device.data as any).chartOptions =
    power_vars.value.map((variable_name) => {
      return {
        seriesType: "View",
        agg: "integral",
        var: variable_name,
        type: "line",
        miss: "none",
      };
    }) ?? [];
  return device as ChartData;
});

const project_id = computed(() => (store.state as RootState).projects.project.id);

const { measurementData, loading: loadingChartData } = useChartData(
  chartData,
  date,
  project_id,
  Periods.MONTH,
  "1d",
);

// flattened and summed up measurementData
// measruement data is an array of arrays of tuples (timestamp and value)
// data is flattened to single array of tuples with all values summed up
const data = computed(() => {
  const arr = [{}];
  for (let i = 0; i < measurementData.value.length; i++) {
    for (let j = 0; j < measurementData.value[i].length; j++) {
      if (arr[0][measurementData.value[i][j][0]] === undefined) {
        arr[0][measurementData.value[i][j][0] / 1000] = measurementData.value[i][j][1];
      } else {
        arr[0][measurementData.value[i][j][0] / 1000] += measurementData.value[i][j][1];
      }
    }
  }
  return arr;
});

const {
  reportModuleData,
  isFetching,
  enabled: dataMappingsEnabled,
} = useReportModuleData(project_id.value);

const chargingSessionsThisWeek = computed(() => {
  return Object.values(reportModuleData.value.week?.cs_state ?? {}).reduce((acc, val) => {
    return acc + val;
  }, 0);
});
const chargingEnergyThisWeek = computed(() => {
  return Object.values(reportModuleData.value.week?.cs ?? {}).reduce((acc, val) => {
    return acc + val;
  }, 0);
});

const chargingAvgEnergyThisWeek = computed(() => {
  return Object.values(reportModuleData.value.week?.cs ?? {}).reduce((avg, val, _, { length }) => {
    return avg + val / length;
  }, 0);
});

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

const includeCharginStation = computed(
  () => reportModuleData?.value?.live?.cs && reportModuleData?.value?.live?.cs?.length != 0,
);
const currentCS = computed(() => {
  if (!includeCharginStation.value) return 0;

  return (
    reportModuleData?.value?.live?.cs?.reduce(
      (acc, current) => reduceMeasurementNames(acc, current),
      0,
    ) / reportModuleData?.value?.live?.cs?.length
  );
});

// Today
const cs_today = computed(() => reportModuleData?.value?.today?.cs);
const cs_state_cycles_today = computed(() => reportModuleData?.value?.today?.cs_cycles);
const cs_earnings_today = computed(() => reportModuleData?.value?.today?.cs_earnings);

onBeforeMount(() => store.dispatch("dataMappings/fetchDataMappings"));
const previewData = computed(() => [
  {
    [new Date("2022-01-01T00:00:00").getTime() / 1000]: 1,
    [new Date("2022-01-02T00:00:00").getTime() / 1000]: 2,
    [new Date("2022-01-03T00:00:00").getTime() / 1000]: 3,
    [new Date("2022-01-04T00:00:00").getTime() / 1000]: 4,
    [new Date("2022-01-05T00:00:00").getTime() / 1000]: 5,
    [new Date("2022-01-06T00:00:00").getTime() / 1000]: 6,
    [new Date("2022-01-07T00:00:00").getTime() / 1000]: 7,
    [new Date("2022-01-08T00:00:00").getTime() / 1000]: 8,
    [new Date("2022-01-09T00:00:00").getTime() / 1000]: 9,
  },
]);

const tableDate = ref<string>(getDateString());

const headers = computed(() => [
  {
    title: t("modules.charging.charging_sessions_header.wallbox"),
    value: "name",
  },
  {
    title: t("modules.charging.charging_sessions_header.start"),
    value: "start",
  },
  {
    title: t("modules.charging.charging_sessions_header.end"),
    value: "end",
  },
  {
    title: t("modules.charging.charging_sessions_header.energy"),
    value: "energy",
  },

  {
    title: t("modules.charging.charging_sessions_header.duration"),
    value: "duration",
  },
]);

const chargingSessions = ref<
  {
    start: number;
    end: number;
    station_id: string;
    energy: number;
    duration: string;
  }[]
>([]);

const loadingReport = ref(false);

onMounted(() => fetchTypes());
watch(tableDate, () => fetchTypes());
const fetchTypes = async () => {
  try {
    loadingReport.value = true;

    const bounds = getAbsoluteBounds(moment(tableDate.value), "week");
    const startTimestamp = Math.max(bounds?.start ?? 0, 0);
    const endTimestamp = bounds?.end;

    const response: {
      data_mapping_id: string;
      end: number;
      energy: number;
      project_id: string;
      start: number;
    }[] = await api.fetch(
      `/projects/${project_id.value}/data-mapping/charging-stations/report?start=${startTimestamp}&end=${endTimestamp}`,
      "GET",
    );

    chargingSessions.value = response.map((item) => {
      return {
        start: item.start,
        end: item.end,
        station_id: item.data_mapping_id,
        energy: item.energy,
        duration: new Date(item.end * 1000 - item.start * 1000).toISOString().substr(11, 8),
      };
    });

    console.log(response);
  } catch (e: any) {
    store.commit("app/setReport", {
      type: "error",
      message: e?.message,
      value: true,
    });
  } finally {
    loadingReport.value = false;
  }
};
</script>

<style lang="scss"></style>
