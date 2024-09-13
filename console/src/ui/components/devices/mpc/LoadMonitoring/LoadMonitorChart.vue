<template>
  <div class="w-100 h-100">
    <Line :id="uid" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  Colors,
  PointElement,
  LinearScale,
  LineElement,
  LineController,
} from "chart.js";
import { v4 as uuidv4 } from "uuid";
import { computed, ref, onBeforeMount, onMounted } from "vue";
import { Line } from "vue-chartjs";
import { useI18n } from "vue-i18n";
import { useTheme, useDisplay } from "vuetify";

import { useChartColors } from "@/ui/components/devices/charts/charts/ChartColors";
import { useTooltipTitleCallback } from "@/ui/components/devices/charts/charts/ChartUtils";
import annotationPlugin from "@/ui/components/devices/mpc/LoadMonitoring/debugPlugin.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  Colors,
  PointElement,
  LineElement,
  LineController,
  annotationPlugin,
);

// Properties

/**
 * @interface Properties
 * @property { nameLine: string } Define the name of the linechart
 * @property { nameArea: string } Define the name of the linechart
 * @property { dataLine: number[ ] } Define the data displayed by the line chart
 * @property { dataArea: number[ ] } Define the data displayed by the area chart
 * @property { categories: number[ ] } Define the values on the x axis of the chart
 * @property { min: number } Define the smallest value of the y axis
 * @property { max: number } Define the biggest value of the y axis
 */
export interface PropsBakingMonitorChart {
  seriesName?: string;
  dataPower: number[];
  dataDetection: number[];
  categories: number[];
  /** Index when the oeprating hours start */
  operatingHoursStart?: number;
  /** Index when the oeprating hours end */
  operatingHoursEnd?: number;
  bakingWindowEnd?: number;
  bakingWindowStart?: number;
}
const props = withDefaults(defineProps<PropsBakingMonitorChart>(), {
  seriesName: "Line",
});

const uid = ref("");
onBeforeMount(() => (uid.value = uuidv4()));

const i18nLocale = useI18n();
function formatDateShort(val, index) {
  return Intl.DateTimeFormat(i18nLocale.locale.value, {
    hour: "numeric",
    minute: "numeric",
  }).format(x_values.value[val]);
}

const operating_hours_window_top = computed(
  () =>
    (props.operatingHoursStart || props.operatingHoursStart == 0) &&
    (props.operatingHoursEnd || props.operatingHoursEnd == 0) && {
      // Indicates the type of annotation
      type: "line",
      xMin: props.operatingHoursStart,
      xMax: props.operatingHoursEnd,
      borderDash: [6, 6],
      borderColor: "green",
      yMax: max_power.value * 1.15,
      yMin: max_power.value * 1.15,
      label: {
        backgroundColor: "lightGreen",
        color: "green",
        content: "Operating Hours",
        display: true,
      },
      font: {
        size: 12,
      },
    },
);

const operatin_hours_window_left = computed(
  () =>
    (props.operatingHoursStart || props.operatingHoursStart == 0) &&
    (props.operatingHoursEnd || props.operatingHoursEnd == 0) && {
      type: "line",
      borderColor: "green",
      borderDash: [],
      borderWidth: 1,
      xMin: props.operatingHoursStart,
      xMax: props.operatingHoursStart,
      xScaleID: "x",
      yMax: max_power.value * 1.15 + max_power.value * 0.02,
      yMin: max_power.value * 1.15 - max_power.value * 0.02,

      yScaleID: "y",
    },
);

const operatin_hours_window_right = computed(
  () =>
    (props.operatingHoursStart || props.operatingHoursStart == 0) &&
    (props.operatingHoursEnd || props.operatingHoursEnd == 0) && {
      type: "line",
      borderColor: "green",
      borderDash: [],
      borderWidth: 1,
      xMin: props.operatingHoursEnd,
      xMax: props.operatingHoursEnd,
      xScaleID: "x",

      yMax: max_power.value * 1.15 + max_power.value * 0.02,
      yMin: max_power.value * 1.15 - max_power.value * 0.02,

      yScaleID: "y",
    },
);

const bake_window_top = computed(
  () =>
    (props.bakingWindowStart || props.bakingWindowStart == 0) &&
    (props.bakingWindowEnd || props.bakingWindowEnd == 0) && {
      // Indicates the type of annotation
      type: "line",
      xMin: props.bakingWindowStart,
      xMax: props.bakingWindowEnd,
      borderDash: [6, 6],
      borderColor: "blue",
      yMax: max_power.value * 1.15,
      yMin: max_power.value * 1.15,
      label: {
        backgroundColor: "lightBlue",
        color: "blue",
        content: "Baking Window",
        display: true,
      },
      font: {
        size: 12,
      },
    },
);

const bake_window_left = computed(
  () =>
    (props.bakingWindowStart || props.bakingWindowStart == 0) &&
    (props.bakingWindowEnd || props.bakingWindowEnd == 0) && {
      type: "line",
      borderColor: "blue",
      borderDash: [],
      borderWidth: 1,
      xMin: props.bakingWindowStart,
      xMax: props.bakingWindowStart,
      xScaleID: "x",
      yMax: max_power.value * 1.15 + max_power.value * 0.02,
      yMin: max_power.value * 1.15 - max_power.value * 0.02,
      yScaleID: "y",
    },
);

const bake_window_right = computed(
  () =>
    (props.bakingWindowStart || props.bakingWindowStart == 0) &&
    (props.bakingWindowEnd || props.bakingWindowEnd == 0) && {
      type: "line",
      borderColor: "blue",
      borderDash: [],
      borderWidth: 1,
      xMin: props.bakingWindowEnd,
      xMax: props.bakingWindowEnd,
      xScaleID: "x",
      yMax: max_power.value * 1.15 + max_power.value * 0.02,
      yMin: max_power.value * 1.15 - max_power.value * 0.02,
      yScaleID: "y",
    },
);

const max_power = computed(() => Math.max(...props.dataPower));

const detection_boxes = computed(() => {
  const detections = getConsecutiveBlocksOfOnes(props.dataDetection);

  const box_array = detections.map((range, i) => {
    return {
      // Indicates the type of annotation
      type: "box",
      xMin: range[0] - 0.5,
      xMax: range[1] + 0.5,
      // xMax: (ctx) => max(ctx, 0, 'x') + 2,
      // xMin: (ctx) => min(ctx, 0, 'x') - 2,
      yMax: (ctx) =>
        Math.max(...ctx.chart.data.datasets[0].data.slice(range[0], range[1] + 1)) +
        max_power.value * 0.1,
      yMin: (ctx) =>
        Math.max(
          Math.min(...ctx.chart.data.datasets[0].data.slice(range[0], range[1] + 1)) -
            max_power.value * 0.1,
          0,
        ),
      backgroundColor: (context) => {
        const { ctx, chartArea } = context.chart as {
          ctx: CanvasRenderingContext2D;
          chartArea: any;
        };

        if (!chartArea) {
          // This case happens on initial chart load
          return "rgba(255, 99, 132, 0.2)";
        }

        const gradient = ctx.createLinearGradient(0, context.element.y, 0, context.element.y2);
        gradient.addColorStop(0, "rgba(255, 99, 132, 0.35)");
        gradient.addColorStop(1, "rgba(255, 99, 132, 0.03)");

        return gradient;
      },
      //"rgba(255, 99, 132, 0.2)",

      index: i,
      borderRadius: 16,
      borderColor: "transparent",
    };
  });
  return box_array.reduce((a, v) => ({ ...a, [`box${v.index}`]: v }), {});
});

const { gridColor, tickColor } = useChartColors();

const commonScaleOptions = computed(() => ({
  ticks: {
    color: tickColor.value,
  },
  border: {
    display: false,
  },
  grid: {
    color: gridColor.value,
  },
}));

const tooltipTitleCallback = useTooltipTitleCallback();

const chartOptions = computed(() => {
  const xOptions = JSON.parse(JSON.stringify(commonScaleOptions.value));
  xOptions.grid = { drawOnChartArea: false };
  (xOptions as any).ticks = { callback: formatDateShort, maxTicksLimit: 24 };
  const yOptions = JSON.parse(JSON.stringify(commonScaleOptions.value));

  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 50,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: tickColor.value,
          usePointStyle: true,
        },
        position: "bottom",
        onClick: function (e: Event) {
          e.stopPropagation();
        },
      },
      tooltip: {
        callbacks: {
          title: tooltipTitleCallback.value,
        },
      },
      annotation: {
        annotations: {
          operatingHourWindow: operating_hours_window_top.value,
          operatinHoursWindowLeft: operatin_hours_window_left.value,
          operatinHoursWindowRight: operatin_hours_window_right.value,
          bakingWindow: bake_window_top.value,
          bakingWindowLeft: bake_window_left.value,
          bakingWindowRight: bake_window_right.value,
          ...detection_boxes.value,
        },
      },
    },
    scales: {
      x: xOptions,
      y: yOptions,
    },
    elements: { line: { tension: 0.1 } },
  };
});

const x_values = computed(() => {
  return props.categories ? props.categories.map((val) => new Date(Number(val))) : [];
});

const chartData = computed(() => {
  return {
    labels: x_values.value,
    datasets: [
      {
        data: props.dataPower,
        label: props.seriesName,
        type: "line",
      },
    ],
  };
});

type IndexRange = [number, number];

function getConsecutiveBlocksOfOnes(arr: number[]): IndexRange[] {
  if (arr.length === 0) return [];

  const blocks: IndexRange[] = [];
  let start: number | null = null;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] !== 0) {
      // If start is null, it means we are at the beginning of a new block of 1s
      if (start === null) {
        start = i;
      }
    } else {
      // If we encounter a 0 and start is not null, it means we are at the end of a block of 1s
      if (start !== null) {
        blocks.push([start, i - 1]);
        start = null;
      }
    }
  }

  // If the last value was a 1, we need to push the last block
  if (start !== null) {
    blocks.push([start, arr.length - 1]);
  }

  return blocks;
}
</script>
