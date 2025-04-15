<template>
  <div
    ref="wrapper"
    :style="`display: grid; grid-template-rows: auto 1fr auto;
      ${
        $vuetify.theme.current.dark
          ? 'background-color: rgb(var(--v-theme-primary-lighten-1));'
          : 'background-color: rgb(var(--v-theme-secondaryDeviceBackground-lighten-1));'
      }`"
    :class="['w-100 h-100 pa-3', $vuetify.display.mobile || isHalfWidth ? 'pt-0' : '']"
  >
    <!-- Header -->
    <div
      :class="[
        'd-flex flex-wrap-reverse justify-end',
        $vuetify.display.mobile ? 'flex-column' : '',
      ]"
      style="min-height: 0; min-width: 0"
    >
      <TimeConfigMenu
        :is-half-width="isHalfWidth"
        :disable-nav-button="loading"
        :show-time-selection="showTimeSelection"
        :navigation-items-to-exclude="navigationItemsToExclude"
        :output-period="period"
        :output-interval="interval"
        @update:output-period="(newVal) => (period = newVal)"
        @update:output-interval="(newVal) => (interval = newVal)"
      />
      <!-- Action Bar -->
      <div v-if="showHeader" class="d-flex align-center justify-center py-2">
        <!-- Fullscreen -->
        <CoreTooltip v-if="!$vuetify.display.mobile" location="bottom">
          <template #activator="{ props: activatorProps }">
            <CoreButton button-type="standardIcon" v-bind="activatorProps" @click="toggle">
              <CoreIcon>fas fa-expand</CoreIcon>
            </CoreButton>
          </template>
          <span>{{ $t("uiComponents.chartTooltips.fullscreen") }}</span>
        </CoreTooltip>
        <!-- Save -->
        <CoreTooltip v-if="showSaveAction" location="bottom">
          <template #activator="{ props: activatorProps }">
            <div v-bind="activatorProps">
              <CoreButton
                style="height: 100%"
                transparent-bg
                button-type="standardIcon"
                :disabled="disableSave"
                @click="saveTimeConfig"
              >
                <CoreIcon>fas fa-floppy-disk</CoreIcon>
              </CoreButton>
            </div>
          </template>
          <span>{{ $t("uiComponents.buttons.save") }}</span>
        </CoreTooltip>
        <!-- Statistics Table -->
        <CoreTooltip location="bottom">
          <template #activator="{ props: activatorProps }">
            <div v-bind="activatorProps">
              <TotalValuesWindow
                :series-stats="seriesStats"
                :disabled="period === 'live'"
                :current-selected-period="period"
                :difference-series-stats="differenceSeriesStats"
              />
            </div>
          </template>
          <span>{{ $t("uiComponents.chartsTotalView.modalButton") }}</span>
        </CoreTooltip>
        <!-- Data Export -->
        <DataExportNew
          v-if="!$vuetify.display.mobile"
          :chart-data="props.chartData"
          :data-to-export="measurementData"
          :is-threshold-line="thresholdValue !== undefined"
          :period-title="period"
        />
        <CoreTooltip location="bottom">
          <template #activator="{ props: activatorProps }">
            <CoreButton
              button-type="standardIcon"
              v-bind="activatorProps"
              :disabled="!areYAxisMerged"
              @click="() => (isStacked = !isStacked)"
            >
              <CoreIcon>fas fa-columns</CoreIcon>
            </CoreButton>
          </template>
          <span>{{ $t("uiComponents.chartTooltips.switchColumn") }}</span>
        </CoreTooltip>
        <DeviceActions
          v-if="showDeviceActions"
          :device="props.chartData"
          @chart-change="handleCalendar"
        />
      </div>
    </div>
    <!-- Chart -->
    <div class="pa-3" style="min-height: 0; min-width: 0">
      <BaseChartView
        v-if="!loading"
        ref="chartInstance"
        :label="label"
        :type="type"
        :x-data="xData"
        :y-data="yData"
        :units="units"
        :loading="loading"
        :end="endChart"
        :period="period"
        :interval="interval"
        :stacked="isStacked"
        :tension="tension"
        :are-y-axis-merged="areYAxisMerged"
        :threshold-value="thresholdValue"
        :background-color="backgroundColor"
        :border-color="borderColor"
        :border-width="borderWidth"
        :point-radius="pointRadius"
        :scale-x-max="scaleXMax"
      />
      <BaseChartLoading v-else />
    </div>
    <!-- Footer -->
    <div v-if="showFooter" style="min-height: 0; min-width: 0">
      <ChartFooter v-model:date="date" :disabled="!isAbsolutePeriod" :period="period" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFullscreen } from "@vueuse/core";
import { cloneDeep, max, mean, min, sum, throttle } from "lodash";
import moment from "moment";
import { computed, onBeforeMount, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex";

import DeviceActions from "@/ui/components/devices/actions/DeviceActions.vue";
import ChartFooter from "@/ui/components/devices/charts/charts/ChartFooter.vue";
import { isAbsolutePeriod as absolutePeriodCheck } from "@/ui/components/devices/charts/charts/ChartUtils";
import DataExportNew from "@/ui/components/devices/charts/charts/DataExportNew.vue";
import TimeConfigMenu from "@/ui/components/devices/charts/charts/TimeConfigMenu.vue";
import { ChartData } from "@/ui/components/devices/charts/charts/types";
import TotalValuesWindow from "@/ui/components/devices/charts/components/TotalValuesWindow.vue";
import { getDateString } from "@/utils/utilsFunctions";
import BaseChartLoading from "./BaseChartLoading.vue";
import BaseChartView from "./BaseChartView.vue";
import { calculate } from "./ChartMath";
import {
  getChartOptions,
  isYAxisMergeable,
  Periods,
  useChartData,
  useChartOptions,
} from "./ChartUtils";

// Properties
interface Props {
  isPreview?: boolean;
  chartData: ChartData;
  thresholdValue?: number;
  showDeviceActions: boolean;
  showSaveAction: boolean;
  showTimeSelection?: boolean;
  minNumberOfSeriesForWideChart?: number;
  navigationItemsToExclude?: string[];
  onEditTrigger: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  postProcessor?: (data: number[][]) => number[][];
}

const props = withDefaults(defineProps<Props>(), {
  isPreview: false,
  thresholdValue: undefined,
  showDeviceActions: true,
  showSaveAction: true,
  showTimeSelection: true,
  navigationItemsToExclude: undefined,
  minNumberOfSeriesForWideChart: 3,
  onEditTrigger: false,
  postProcessor: undefined,
  showHeader: true,
  showFooter: true,
});

// Emits
const emit = defineEmits<{
  (e: "chartRangeChange", value: any): void;
  (e: "handleAutarkiegrad", value: any): void;
}>();

// Composables
const store = useStore();
const route = useRoute();

// Chart Labels
const label = computed<string[]>(() => {
  return props.chartData.data.chartOptions.map((object) => object.name);
});

// Chart Types
const type = computed<string[]>(() => {
  const result = props.chartData.data.chartOptions.map((object) => object.type);
  if (result.includes("column")) {
    return result.map((type) => (type === "column" ? "bar" : type));
  }
  return result;
});

// Chart Units
const units = computed(() => {
  return props.chartData.data.chartOptions.map((object) => object.unit);
});

const tension = computed(() => props.chartData.data.tension || 0.1);

const backgroundColor = computed(() =>
  props.chartData.data.chartOptions.map((object) => object.backgroundColor).filter((i) => !!i),
);

const borderColor = computed(() =>
  props.chartData.data.chartOptions.map((object) => object.borderColor).filter((i) => !!i),
);

const borderWidth = computed(() =>
  props.chartData.data.chartOptions.map((object) => object.borderWidth).filter((i) => !!i),
);

const pointRadius = computed(() =>
  props.chartData.data.chartOptions.map((object) => object.pointRadius).filter((i) => !!i),
);

const isAdam = computed(() => props.chartData.data.type === "adam");

const scaleXMax = computed(() => props.chartData.data.scaleXMax);
// DOM Element Reference
const chartInstance = ref();

const isAbsolutePeriod = computed<boolean>(() => {
  return absolutePeriodCheck(period.value);
});

const throttledUpdate = throttle(() => {
  updateChartWithLiveData();
}, 5000);

// Get the chart data
const date = ref<string>(getDateString());

const { period, interval } = useChartOptions(
  props.chartData?.data?.periodName,
  props.chartData?.data?.interval,
);

const { measurementData, loading, endDate, endChart } = useChartData(
  props.chartData,
  date,
  route.params.id, // projectId
  period,
  interval,
  props.isPreview,
);

const isStacked = ref(props.chartData?.data?.selectedStackingOptions === "normal");

// Extract the y data from the measurement data
const yData = computed<number[][]>(() => {
  const result = [];

  for (let i = 0; i < measurementData.value.length; i++) {
    const chart = measurementData.value[i];
    result.push(chart.map((pair) => pair[1]));
  }

  if (!!props.postProcessor) return props.postProcessor(result);
  return result;
});

// Extract the x data from the measurement data
const xData = computed<number[]>(() => {
  const result: number[] = [];

  if (measurementData.value.length === 0) return result;
  measurementData.value[0].map((pair) => {
    result.push(pair[0]);
  });

  return result;
});

// Computed Properties
const areYAxisMerged = computed(() => isYAxisMergeable(getChartOptions(props.chartData!)));

const liveDataChartOptions = computed(() => {
  const measurements = store.getters["measurements/measurements"];

  if (!!!props.chartData) {
    return null;
  }

  return getChartOptions(props.chartData).map((optionsItem: any, index: number) => {
    if (props.chartData?.data.chartOptions[index].seriesType === "Threshold") {
      return null;
    } else if (
      props.chartData?.data.mappings ||
      props.chartData?.data.chartOptions[index].seriesType === "View"
    ) {
      // view
      // either old chart, or new chart of type view
      const variable = props.chartData.data.mappings
        ? Object.values(props.chartData.data.mappings)[index]
        : optionsItem.var;

      return measurements[variable];
    } else {
      // calculation
      return calculate(optionsItem.calculation.expression, measurements);
    }
  });
});

watch([period, interval, date, props], handleCalendar, {
  deep: true,
  immediate: true,
});

// Load chart data according to date picked in calendar
async function handleCalendar() {
  emit("chartRangeChange", { start: moment(date.value).unix(), end: endDate.value });

  emit("handleAutarkiegrad", {
    start: moment(date.value).unix(),
    end: endDate.value,
    endChart: endChart.value,
  });
}

const isHalfWidth = computed(() => props.chartData.data.selectedWidth === "half");

// // Statistics data based on the chart data
const seriesStats = computed(() => {
  const arr = [] as {
    name: string;
    minValue: string;
    maxValue: string;
    avgValue: string;
    unit: string;
  }[];
  const chartOptions = getChartOptions(props.chartData!).filter((element: any) =>
    Object.hasOwn(element, "seriesType")
      ? element.seriesType !== "Threshold"
      : element.type !== "Threshold",
  );
  chartOptions.forEach((optionsItem: any, index: number) => {
    let valuesArray;
    let seriesName = optionsItem.name;

    if (optionsItem.agg !== "diff") {
      valuesArray = getValuesOfSeries(index, optionsItem.type);

      const maxValue: number = max(valuesArray) ?? 0;
      const minValue: number = min(valuesArray) ?? 0;
      // return avg of all numbers in array: https://www.geeksforgeeks.org/lodash-_-mean-method/
      const avgValue: number = mean(valuesArray) ?? 0;

      if (seriesName === "") {
        seriesName = getNameOfSeries(optionsItem, index);
      }

      arr.push({
        name: seriesName,
        minValue: minValue.toFixed(2),
        maxValue: maxValue.toFixed(2),
        avgValue: avgValue.toFixed(2),
        unit: optionsItem.unit,
      });
    }
  });
  return arr;
});

const differenceSeriesStats = computed(() => {
  const arr = [] as { name: string; sum: string; unit: string }[];
  const chartOptions = getChartOptions(props.chartData!).filter((element: any) =>
    Object.hasOwn(element, "seriesType")
      ? element.seriesType !== "Threshold"
      : element.type !== "Threshold",
  );
  chartOptions.forEach((optionsItem: any, index: number) => {
    let valuesArray;
    let seriesName = optionsItem.name;

    if (optionsItem.agg === "diff") {
      valuesArray = getValuesOfSeries(index, optionsItem.type);

      const totalValue = sum(valuesArray) ?? 0;

      if (seriesName === "") {
        seriesName = getNameOfSeries(optionsItem, index);
      }

      arr.push({
        name: seriesName,
        sum: totalValue.toFixed(2),
        unit: optionsItem.unit,
      });
    }
  });
  return arr;
});

const getNameOfSeries = (optionsItem: any, index: number) => {
  let name = "";

  if (optionsItem.var === undefined) {
    name = `Calculation_${index}`;
  } else {
    name = `${optionsItem.var}`;
  }

  return name;
};

const getValuesOfSeries = (index: number, type: string) => {
  return yData.value[index];
};

const updateChartWithLiveData = () => {
  if (period.value === Periods.LIVE) {
    liveDataChartOptions.value?.forEach((value, index) => {
      chartInstance.value?.updateChart(index, value);
    });
  }
};

// Watchers

watch(() => liveDataChartOptions.value, throttledUpdate, {
  deep: true,
  immediate: true,
});

const wrapper = ref<HTMLElement | null>(null);

const { toggle } = useFullscreen(wrapper);

const disableSave = computed(() => {
  return (
    props.chartData.data.interval === interval.value &&
    props.chartData.data.periodName === period.value &&
    props.chartData.data.selectedStackingOptions === (isStacked.value ? "normal" : "")
  );
});

async function saveTimeConfig() {
  const dataToSave = cloneDeep(props.chartData);
  dataToSave.data.periodName = period.value;
  dataToSave.data.interval = interval.value;
  dataToSave.data.selectedStackingOptions = isStacked.value ? "normal" : "";

  await store.dispatch("devices/updateChartOptionsWithoutMessage", dataToSave);
}

watch(
  () => props,
  () => {
    interval.value = !props.showSaveAction ? "15m" : props.chartData?.data?.interval;
    period.value = !props.showSaveAction ? "day" : props.chartData?.data?.periodName;
    isStacked.value = props.chartData?.data?.selectedStackingOptions === "normal";
  },
  {
    deep: true,
    immediate: true,
  },
);

onBeforeMount(() => {
  interval.value = !props.showSaveAction ? "15m" : props.chartData?.data?.interval;
  period.value = !props.showSaveAction ? "day" : props.chartData?.data?.periodName;
  isStacked.value = props.chartData?.data?.selectedStackingOptions === "normal";
});
</script>
