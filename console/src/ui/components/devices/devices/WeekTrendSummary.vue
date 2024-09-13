<template>
  <DeviceLayout
    :device-data="props.deviceData"
    :is-preview="props.isPreview"
    :preview-data="props.deviceData"
  >
    <template #title>
      <div class="flex-grow-1">
        {{ t("devices.WeekTrendSummary.previewName") }}
      </div>
    </template>
    <template v-if="$vuetify.display.mobile" #actions>
      <WeekTrendSummaryTableModal
        :name="props.deviceData.name"
        :items="tableItems"
        :formatted-trend="trendNumberFormated"
        :show-trend-note="trendNote"
        :formatted-average="averageNumberFormated"
      />
    </template>
    <template #basic-controls>
      <div style="display: grid; grid-template-rows: 1fr min-content" class="w-100 h-100 pa-1">
        <CoreRow v-if="!loading">
          <CoreColumn cols="12" md="4">
            <CoreRow>
              <CoreColumn cols="12" class="text-center py-0 mb-0 text-medium-emphasis">
                {{ isPreview ? props.deviceData.name : props.deviceData.name }}
              </CoreColumn>
              <CoreColumn cols="12" class="text-center py-0 mb-0 text-medium-emphasis">
                <CoreDivider />
              </CoreColumn>
            </CoreRow>
            <CoreRow class="pa-4 pb-0">
              <CoreColumn cols="12">
                <ReportField
                  :title="trendTitle"
                  :number="trend"
                  unit="%"
                  :icon="trendIcon"
                  :icon-color="iconColor"
                  :animate="false"
                />
              </CoreColumn>
              <CoreColumn cols="12">
                <ReportField
                  :title="t('devices.WeekTrendSummary.mainView.average')"
                  :number="average"
                  unit="kWh"
                  icon="fa-chart-simple"
                  icon-color="accent"
                  :animate="false"
                />
              </CoreColumn>
              <CoreSpacer />
            </CoreRow>
            <!-- <CoreCard class="pa-3" elevation="1"> Trend Card </CoreCard> -->
          </CoreColumn>
          <CoreColumn cols="12" md="8" class="w-100">
            <Chart
              :data="data"
              :titles="titles"
              :types="types"
              :y-axisis="yAxisis"
              :units="units"
              :labels="labels"
              legend-position="top"
              style="min-height: 0; min-width: 0"
            />
          </CoreColumn>
        </CoreRow>
        <CircleSpinner
          v-else
          :size="80"
          color="accent"
          class="d-flex justify-center align-center w-100 h-100"
        />
        <CoreRow cols="12" md="4">
          <CoreColumn v-if="!$vuetify.display.mobile">
            <WeekTrendSummaryTableModal
              :name="props.deviceData.name"
              :items="tableItems"
              :formatted-trend="trendNumberFormated"
              :show-trend-note="trendNote"
              :formatted-average="averageNumberFormated"
            />
          </CoreColumn>
          <CoreColumn>
            <ChartFooter
              v-model:date="date"
              :disabled="loading"
              :period="Periods.WEEK"
              :format="'date'"
            />
          </CoreColumn>
          <CoreColumn v-if="!$vuetify.display.mobile"></CoreColumn>
        </CoreRow>
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts" setup>
import { cloneDeep } from "lodash";
import moment from "moment";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import { RootState } from "@/store/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import ChartFooter from "@/ui/components/devices/charts/charts/ChartFooter.vue";
import { useChartData, Periods } from "@/ui/components/devices/charts/charts/ChartUtils";
import { CommonDeviceProps } from "@/ui/components/devices/devices/DeviceBaseComposables";
import WeekTrendSummaryTableModal from "@/ui/components/devices/devices/WeekTrendSummaryTableModal.vue";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import Chart from "@/ui/components/devices/modules/ReportModule/Chart.vue";
import ReportField from "@/ui/components/devices/modules/ReportModule/ReportField.vue";
import { getDateString } from "@/utils/utilsFunctions";

const props = defineProps<CommonDeviceProps>();

const { t, locale } = useI18n();

const titles = computed(() => {
  return [
    t("devices.WeekTrendSummary.mainView.lastWeek"),
    t("devices.WeekTrendSummary.mainView.thisWeek"),
  ];
});
const types = computed(() => {
  return ["bar", "bar"];
});
const yAxisis = computed(() => {
  return ["1", "1"];
});

const date = ref<string>(getDateString());

const chartData = computed(() => {
  const device = cloneDeep(props.deviceData);
  device.data.chartOptions = [
    {
      seriesType: "View",
      agg: "sum",
      var: device.data.mappings["Input_actualValue"],
      type: "line",
    },
  ];
  return device as ChartData;
});

const store = useStore();

const project_id = computed(() => (store.state as RootState).projects.project.id);

const { measurementData: currentWeekData, loading: loadingCurrentWeek } = useChartData(
  chartData,
  date,
  project_id,
  Periods.WEEK,
  "1d",
);

const selectedWeekData = computed(() => {
  if (props.isPreview) return previewWeekData.value;
  return currentWeekData.value;
});

const startDateLastWeek = computed(() => moment(date.value).add(-7, "days").toISOString());
const { measurementData: currentLastData, loading: loadingLastWeek } = useChartData(
  chartData,
  startDateLastWeek,
  project_id,
  Periods.WEEK,
  "1d",
);

const previousdWeekData = computed(() => {
  if (props.isPreview) return previewLastData.value;
  return currentLastData.value;
});

const loading = computed(() => {
  if (props.isPreview) return false;
  return loadingCurrentWeek.value || loadingLastWeek.value;
});

const dataNotAvailable = computed(
  () =>
    loading.value ||
    !selectedWeekData.value ||
    !previousdWeekData.value ||
    selectedWeekData.value.length === 0 ||
    previousdWeekData.value.length === 0,
);

const data = computed(() => {
  if (dataNotAvailable.value) {
    return [];
  }
  // need to parse array with values [timestamp, value] to object {[timestamp]:value}
  const current = Object.fromEntries(
    selectedWeekData.value[0].map(([timestamp, value]) => {
      return [timestamp / 1000, value];
    }),
  );
  const last = Object.fromEntries(
    previousdWeekData.value[0].map(([timestamp, value]) => {
      return [timestamp / 1000, value];
    }),
  );
  return [last, current];
});

const units = computed(() => {
  if (dataNotAvailable.value) {
    return [];
  }
  const l = (previousdWeekData.value[0] as []).length;
  const l2 = (selectedWeekData.value[0] as []).length;

  return Array(Math.max(l, l2)).fill("kWh");
});

const labels = computed(() => {
  if (dataNotAvailable.value) {
    return [];
  }
  moment.locale(locale.value);

  const l = (previousdWeekData.value[0] as []).length;
  const l2 = (selectedWeekData.value[0] as []).length;

  const array = l > l2 ? previousdWeekData.value[0] : selectedWeekData.value[0];
  return array.map((val) => {
    return new Intl.DateTimeFormat(locale.value, { weekday: "short" }).format(new Date(val[0]));
  });
});

const trend = computed(() => {
  if (dataNotAvailable.value) {
    return 0;
  }
  const current = (selectedWeekData.value[0] as []).reduce((acc, val) => {
    return (acc += val[1]);
  }, 0);
  const last = (previousdWeekData.value[0] as []).reduce((acc, val) => {
    return (acc += val[1]);
  }, 0);
  return ((current - last) / last) * 100;
});

const trendNumberFormated = computed(() => {
  if (trend.value === 0) return "-";
  return Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 1,
  }).format(trend.value);
});

const trendNote = computed(() => {
  return selectedWeekData.value[0]?.length !== previousdWeekData.value[0]?.length;
});

const average = computed(() => {
  if (dataNotAvailable.value) {
    return 0;
  }
  const current = (selectedWeekData.value[0] as []).reduce((acc, val) => {
    return (acc += val[1]);
  }, 0);

  return current / selectedWeekData.value[0].length;
});

const averageNumberFormated = computed(() => {
  if (average.value === 0) return "-";
  return Intl.NumberFormat(locale.value, {
    maximumFractionDigits: 1,
  }).format(average.value);
});

const trendIcon = computed(() => (trend.value > 0 ? "fa-arrow-trend-up" : "fa-arrow-trend-down"));
const iconColor = computed(() => (trend.value < 0 ? "success" : "error"));
const trendTitle = computed(() =>
  trend.value > 0
    ? t("devices.WeekTrendSummary.mainView.moreUsage")
    : t("devices.WeekTrendSummary.mainView.lessUsage"),
);

const tableItems = computed(() => {
  const items = [] as {
    name: string;
    previousWeek: string;
    selectedWeek: string;
    trend: number | string;
    diff: string;
  }[];
  if (dataNotAvailable.value) {
    return items;
  }

  (labels.value as []).forEach((item, index) => {
    const lastTuple = previousdWeekData.value[0][index];
    const currentTuple = selectedWeekData.value[0][index];
    const formatOptions = {
      maximumFractionDigits: 1,
    };
    const lastVal = lastTuple
      ? Intl.NumberFormat(locale.value, formatOptions).format(lastTuple[1]) + " kWh"
      : "-";
    const currentVal = currentTuple
      ? Intl.NumberFormat(locale.value, formatOptions).format(currentTuple[1]) + " kWh"
      : "-";

    const diff = lastVal !== "-" && currentVal !== "-" ? currentTuple[1] - lastTuple[1] : "-";
    const diffFormatted =
      diff !== "-" ? Intl.NumberFormat(locale.value, formatOptions).format(diff) + " kWh" : "-";
    const trend = diff !== "-" ? (diff / lastTuple[1]) * 100 : "-";
    const dailyAverageFormatted =
      diff !== "-"
        ? Intl.NumberFormat(locale.value, formatOptions).format(
            (currentTuple[1] + lastTuple[1]) / 2,
          ) + " kWh"
        : "-";
    items.push({
      name: item,
      previousWeek: lastVal,
      selectedWeek: currentVal,
      trend: trend,
      diff: diffFormatted,
      dailyAverage: dailyAverageFormatted,
    });
  });

  return items;
});

const previewLastData = computed(() => [
  [
    [1719093600000, 28094.01],
    [1719180000000, 28497.489999999998],
    [1719266400000, 28699.221],
    [1719352800000, 31063.870000000003],
    [1719439200000, 26664.309999999998],
    [1719525600000, 27109.08],
    [1719612000000, 27418.779999999995],
  ],
]);
const previewWeekData = computed(() => [
  [
    [1719093600000, 28094.01],
    [1719180000000, 28497.489999999998],
    [1719266400000, 28699.221],
    [1719352800000, 31063.870000000003],
    [1719439200000, 26664.309999999998],
    [1719525600000, 27109.08],
    [1719612000000, 27418.779999999995],
  ],
]);
</script>
