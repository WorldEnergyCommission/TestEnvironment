<template>
  <DefaultDeviceLayout
    class="swiper-no-swiping"
    :is-preview="props.isPreview"
    :device-data="props.deviceData"
    :preview-data="props.deviceData"
  >
    <template #actions>
      <LoadMonitorTable
        :project-id="deviceData.project_id!"
        :model-id="deviceData.id"
        :name="props.deviceData.name"
        @selected="setDateForReport"
      />
    </template>
    <template #custom-icon />
    <template #basic-controls>
      <div style="display: grid; grid-template-rows: 1fr min-content" class="ma-3 w-100 h-100">
        <div class="d-flex justify-center" style="min-height: 0; min-width: 0">
          <LoadMonitorChart
            v-if="!busy"
            :data-power="powerValues"
            :data-detection="predictionValues"
            :series-name="t('mlModel.BakingMonitor.additionalMappings.name_line')"
            :categories="xValues"
            :operating-hours-start="operatingHoursStart"
            :operating-hours-end="operatingHoursEnd"
            :baking-window-start="bakingWindowStart"
            :baking-window-end="bakingWindowEnd"
          />
          <CircleSpinner
            v-else
            :size="80"
            color="accent"
            class="d-flex justify-center align-center"
          />
        </div>
        <ChartFooter v-model:date="date" />
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
    <template #settings-view>
      <LoadMonitorSettings :device-data="deviceData" @updated="rerenderDevice" />
    </template>
  </DefaultDeviceLayout>
</template>

<script setup lang="ts">
import moment from "moment";
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useStore } from "vuex";

import LoadMonitorChart from "./LoadMonitorChart.vue";
import LoadMonitorSettings from "./LoadMonitorSettings.vue";
import LoadMonitorTable from "./LoadMonitorTable.vue";
import DefaultDeviceLayout from "../../layout/DefaultDeviceLayout.vue";
import { IDevice } from "@/store/modules/devices/types";
import CircleSpinner from "@/ui/components/components/CircleSpinner.vue";
import { OperatingSchedule } from "@/ui/components/lists/SettingsList/OperatingHours.vue";
import ChartFooter from "@/ui/components/devices/charts/charts/ChartFooter.vue";

// Properties
interface Props {
  deviceData: IDevice;
  isPreview?: boolean;
  loadMonitorType?: string;
}

const props = withDefaults(defineProps<Props>(), {
  isPreview: false,
  loadMonitorType: "bakingMonitor",
});

// Constants
const { t } = useI18n();
const busy = ref(false);
const store = useStore();
const mpc = ref<any>(null);

// Axis Values
const xValues = ref<number[]>([]);
const powerValues = ref<number[]>([]);
const predictionValues = ref<number[]>([]);
const bakingWindowEnd = ref<number | undefined>(undefined);
const bakingWindowStart = ref<number | undefined>(undefined);
const operatingHoursEnd = ref<number | undefined>(undefined);
const operatingHoursStart = ref<number | undefined>(undefined);

// date picker vals
const date = ref<string>("");

// Chart Values
const chartInterval = ref("15m");
const chartAggregation = ref("integral");
const chartDateTo = computed(() => {
  const eod =
    date.value != "" ? moment(date.value).endOf("day").unix() : moment().endOf("day").unix();

  return eod > moment().unix() ? moment().unix() : eod;
});
const chartDateFrom = computed(() => {
  return date.value != ""
    ? moment(date.value).startOf("day").unix()
    : moment().startOf("day").unix();
});

// Functions
const rerenderDevice = async () => {
  mpc.value = null;
  mpc.value = await fetchMPCData(props.deviceData.id);

  if (props.loadMonitorType === "bakingMonitor") {
    await initBakingMonitor();
  }
};

const fetchMPCData = (payload: any) => {
  return store.dispatch("mpc/fetchMPCData", payload);
};

const handleChartDate = async () => {
  await initBakingMonitor();
};

// Get transformed device ID
const deviceIdTransformed = computed(() => {
  const deviceId = props.deviceData.id;
  return deviceId.replace(/-/g, "_").toLowerCase();
});

// Load the bake time variable from the AI Model
const loadMonitorVariable = computed(() => {
  return `LM.${deviceIdTransformed.value}.load`;
});

// Initialize workflow for baking monitor
const initBakingMonitor = async () => {
  busy.value = true;

  operatingHoursEnd.value = undefined;
  operatingHoursStart.value = undefined;

  if (!mpc.value) {
    console.log("mpc value empty", mpc.value);
    return;
  }
  // Fetch data for the bake time with the "LM.deviceId.load" variable
  const resultBakeTime: any[][] = await store.dispatch("charts/fetchChartAgg", {
    variable: loadMonitorVariable.value,
    from: chartDateFrom.value,
    to: chartDateTo.value,
    agg: chartAggregation.value,
    interval: chartInterval.value ?? "15m",
    miss: "none",
  });

  // Fetch data for the power consumtion
  const resultPowerConsumption: any[][] = await store.dispatch("charts/fetchChartAgg", {
    variable: mpc.value.data.meta.controllerMappings.power,
    from: chartDateFrom.value,
    to: chartDateTo.value,
    agg: chartAggregation.value,
    interval: chartInterval.value ?? "15m",
    miss: "none",
  });

  const res = await store.dispatch("projects/loadProjectOperatingHours");

  // if (res.data) data.operating_hours = res.data.operating_hours as OperatingSchedule;

  xValues.value = resultPowerConsumption.map(([timestamp]) => {
    return timestamp * 1000;
  });

  date.value = new Date(xValues.value[0]).toISOString();

  powerValues.value = resultPowerConsumption.map(([, power]) => {
    return power;
  });

  predictionValues.value = resultBakeTime.map(([, baking]) => {
    return baking;
  });

  const operatingIndixes = findOperatingHoursTimestamps(
    resultPowerConsumption.map(([timestamp]) => {
      return timestamp;
    }),
    res.data.operating_hours,
  );

  if (operatingIndixes) {
    operatingHoursEnd.value = operatingIndixes[1];
    operatingHoursStart.value = operatingIndixes[0];
  }

  if (operatingHoursStart.value) {
    const timestamps = resultPowerConsumption.map(([timestamp]) => {
      return timestamp;
    });

    bakingWindowEnd.value = operatingHoursStart.value;
    bakingWindowStart.value = findNearestIndex(
      timestamps,
      timestamps[operatingHoursStart.value] -
        mpc.value.data.meta.settings.bakingWindowDuration * 60,
    );
  }

  busy.value = false;
};

function findNearestIndex(arr: number[], target: number) {
  if (arr.length === 0) {
    throw new Error("The array is empty");
  }

  let nearestIndex = 0;
  let minDiff = Math.abs(arr[0] - target);

  for (let i = 1; i < arr.length; i++) {
    const diff = Math.abs(arr[i] - target);
    if (diff < minDiff) {
      minDiff = diff;
      nearestIndex = i;
    }
  }

  return nearestIndex;
}

watch(
  () => date.value,
  () => {
    handleChartDate();
  },
);

// This watcher decides which workflow to start based on the loadMonitorType provided
watch(
  () => props.loadMonitorType,
  () => {
    rerenderDevice();
  },
  {
    immediate: true,
  },
);

// Define the 'Time' type
type Time = {
  hours: number;
  minutes: number;
  seconds: number;
};

// Function to convert day, hours, minutes, and seconds to Unix timestamp
function getUnixTimestamp(date: Date, time: Time): number {
  const newDate = new Date(date);
  newDate.setHours(time.hours, time.minutes, time.seconds, 0);
  return Math.floor(newDate.getTime() / 1000);
}

function findOperatingHoursTimestamps(timestamps: number[], weekSchedule: OperatingSchedule) {
  const indexes = [] as number[];

  timestamps.forEach((timestamp, index) => {
    const date = new Date(timestamp * 1000);
    const day = date.getDay(); // Get the day of the week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)

    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const dayName = days[day];

    const anySchedule = weekSchedule as any;
    if (anySchedule[dayName] && anySchedule[dayName].enabled) {
      const startTime: Time = anySchedule[dayName].start;
      const endTime: Time = anySchedule[dayName].end;

      if (startTime && endTime) {
        const startTimestamp = getUnixTimestamp(date, startTime);
        const endTimestamp = getUnixTimestamp(date, endTime);

        if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
          indexes.push(index);
        }
      }
    }
  });

  if (indexes.length === 1) {
    return [indexes[0], timestamps.length - 1];
  }
  if (indexes.length < 2) {
    return undefined;
  }

  return [indexes[0], indexes[indexes.length - 1]];
}

function setDateForReport(value: number) {
  date.value = moment(value * 1000).format("YYYY-MM-DD");
}
</script>

<style scoped lang="scss">
.chart-input {
  display: flex;
  background-color: red;
  gap: 5rem;
  width: 100%;
}
</style>
