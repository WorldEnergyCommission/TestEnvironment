<template>
  <div ref="el" class="w-100 h-100">
    <!-- Upper Chart -->
    <apexchart
      v-if="showChart"
      height="80%"
      :width="chartWidth ? chartWidth.toString() + 'px' : '100px'"
      :options="optionsUpper"
      :series="optionsUpper?.series"
      style="max-width: fit-content; margin-left: auto; margin-right: auto"
    />
    <!-- Lower Chart -->
    <apexchart
      v-if="showChart"
      height="20%"
      :width="chartWidth ? chartWidth.toString() + 'px' : '100px'"
      :options="optionsLower"
      :series="optionsLower?.series"
      style="max-width: fit-content; margin-left: auto; margin-right: auto"
    />
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from "@vueuse/core";
import { ApexOptions } from "apexcharts";
import { computed, ref } from "vue";

import { PropsBakingMonitorChart } from "../ApexModel";

// Properties
const props = withDefaults(defineProps<PropsBakingMonitorChart>(), {
  nameBakeTime: "Area",
  namePowerConsumtion: "Line",
  nameBakeWindowAndOpeningHours: "Range",
  min: 0,
  max: 100,
});

// Constants

const el = ref(null);
const { width, height } = useElementSize(el);
const showChart = computed(() => chartWidth.value && chartWidth.value > 0);
const chartWidth = computed(() => (width.value ? Math.round(width.value * 0.9) : null));

const twoHoursAsTimestampAmount = 2 * 60 * 60 * 1000;

function getTimestampForTime(hours: number, minutes: number): number {
  const now = new Date(); // Get the current date and time
  now.setHours(hours, minutes, 0, 0); // Set the hours and minutes, keep the other components unchanged
  return now.getTime() + twoHoursAsTimestampAmount; // Return the timestamp in milliseconds
}

// Series
const powerConsumptionSeries = computed(() => ({
  name: props.namePowerConsumtion,
  type: "line",
  data: props.dataPowerConsumption,
  color: "#2b4eed",
}));

const bakeTimeSeries = computed(() => ({
  name: props.nameBakeTime,
  type: "area",
  data: props.dataBakeTime,
  color: "#e33d3d",
}));

const bakeWindowAndOpeningHoursSeries = computed(() => {
  return {
    data: [
      {
        x: "Baking Window",
        y: [getTimestampForTime(3, 0), getTimestampForTime(6, 0)],
      },
      {
        x: "Opening Hours",
        y: [getTimestampForTime(7, 0), getTimestampForTime(18, 0)],
      },
    ],
  };
});

const xAxisUpper = computed<ApexXAxis>(() => ({
  type: "datetime",
  // Shift the timezone to (GMT +2)
  categories: props.categories.map((timestamp) => timestamp + twoHoursAsTimestampAmount),
  labels: {
    show: false,
  },
}));
const yAxisUpper = computed<ApexXAxis>(() => ({
  max: props.max,
  min: props.min,
  labels: {
    show: false,
  },
}));

// Chart Options
const optionsUpper = computed(() => {
  // Y and X Axis

  return {
    chart: {
      type: "line",
      toolbar: { tools: { zoom: false, pan: false, reset: false } },
    },
    series: [powerConsumptionSeries.value, bakeTimeSeries.value],
    xaxis: xAxisUpper.value,
    yaxis: yAxisUpper.value,
    stroke: {
      width: 2,
    },
    legend: {
      position: "top",
    },
  };
});

const optionsLower = computed(() => {
  const xAxisLower: ApexXAxis = {
    type: "datetime",
    labels: {
      datetimeFormatter: {
        hour: "HH",
        minute: "mm",
      },
      format: "HH:mm", // Format for the labels (hour:minute)
    },
    min: new Date().setHours(0, 0, 0, 0) + twoHoursAsTimestampAmount, // Start of the current day
    max: new Date().setHours(23, 59, 59, 999) + twoHoursAsTimestampAmount, // End of the current day
    tickAmount: 24, // Show a label for each hour
  };

  const yAxisLower: ApexYAxis = {
    labels: {
      show: false,
    },
    show: true,
    axisBorder: {
      show: false,
    },
  };

  return {
    chart: {
      type: "rangeBar",
      toolbar: {
        tools: {
          pan: false,
          zoom: false,
          reset: false,
          zoomin: false,
          zoomout: false,
          download: false,
          selection: false,
        },
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
        distributed: true,
      },
      axisBorder: {
        show: false,
      },
    },
    dataLabels: {
      enabled: true,
      textAnchor: "middle",
      style: {
        colors: ["#fff"],
      },
      formatter: function (val, opt) {
        return opt.w.globals.labels[opt.dataPointIndex];
      },
      offsetX: 0,
      dropShadow: {
        enabled: true,
      },
    },
    series: [bakeWindowAndOpeningHoursSeries.value],
    xaxis: xAxisLower,
    yaxis: yAxisLower,
    grid: {
      show: false,
      padding: {
        top: -36,
      },
    },
  };
});

//   const optionsUpper = ref();
// const optionsLower = ref<ApexOptions>();
</script>
