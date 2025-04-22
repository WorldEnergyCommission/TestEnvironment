<template>
  <div class="w-100 h-100">
    <Line
      :id="uid"
      ref="chart"
      :data="chartData"
      :options="chartOptions"
      class="swiper-no-swiping"
    />
  </div>
</template>

<script setup lang="ts">
import {
  BarElement,
  CategoryScale,
  ChartEvent,
  Chart as ChartJS,
  Colors,
  Filler,
  Legend,
  LegendElement,
  LegendItem,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  TimeSeriesScale,
  Title,
  Tooltip,
  TooltipItem,
} from "chart.js";
import "chartjs-adapter-moment";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { computed, onBeforeMount, ref } from "vue";
import { Line } from "vue-chartjs";
import { useI18n } from "vue-i18n";

import annotationPlugin from "@/ui/components/devices/mpc/LoadMonitoring/debugPlugin.js";
import { useChartColors } from "./ChartColors";
import {
  Periods,
  intervalsInSeconds,
  periodConfigurations,
  useTooltipFooterCallback,
  useTooltipTitleCallback,
} from "./ChartUtils";

// Properties
interface Props {
  xData: number[];
  yData: number[][];
  label: string[];
  type: string[];
  units: string[];
  loading: boolean;
  start?: number;
  end?: number;
  period: string;
  interval?: string;
  stacked?: boolean;
  tension?: number;
  backgroundColor?: string[];
  borderColor?: string[];
  borderWidth?: string[];
  pointRadius?: string[];
  areYAxisMerged?: boolean;
  thresholdValue?: number;
  scaleXMax?: string;
  plugins?: any[];
}

const props = defineProps<Props>();

ChartJS.register(
  Title,
  Legend,
  Colors,
  Filler,
  Tooltip,
  annotationPlugin,
  BarElement,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  LineController,
  TimeSeriesScale,
  ...(props.plugins || []),
);

// Composables
const i18nLocale = useI18n();
const { colors, colorsLight, gridColor, tickColor } = useChartColors();

const uid = ref("");
const chart = ref();

// Data
const chartData = computed(() => {
  return {
    labels: labels.value,
    datasets: datasets.value,
  };
});

const labels = computed(() => {
  const ticks = props.xData; // The ticks are timestamps
  const lastTimestamp = ticks[ticks.length - 1];
  let tmp = lastTimestamp;
  while (tmp < props.end * 1000) {
    tmp += (intervalsInSeconds[props.interval] ?? 60) * 1000;
    ticks.push(tmp);
  }
  return ticks.map((timestamp) => timestamp);
});

const datasets = computed(() => {
  const result = [];

  const pointStyle = props.yData.find((data) => data.length > 100) ? false : "circle";

  for (let i = 0; i < props.yData.length; i++) {
    const data: number[] = [];

    for (let j = 0; j < labels.value.length; j++) {
      const d = { x: labels.value[j] };

      if (j < props.yData[i].length) {
        d["y"] = props.yData[i][j];
      }
      data.push(d);
    }

    const borderWidth = props.borderWidth?.length > 0 ? props.borderWidth[i] : undefined;
    const pointRadius = props.pointRadius?.length > 0 ? props.pointRadius[i] : undefined;

    const borderColor =
      props.borderColor?.length > 0
        ? props.borderColor[i % props.borderColor.length]
        : colors.value[i % colors.value.length];

    const backgroundColor =
      props.backgroundColor?.length > 0
        ? props.backgroundColor[i % props.backgroundColor.length]
        : colorsLight.value[i % colorsLight.value.length];

    result.push({
      data,
      label: props.label[i],
      type: props.type[i] === "area" ? "line" : props.type[i], // Only Push "line", "area" is only the fill effect below
      fill: props.type.includes("area") ? true : false,
      borderWidth,
      borderColor,
      backgroundColor,
      pointRadius,
      yAxisID: props.areYAxisMerged ? getAxisID(0) : getAxisID(i),
      pointStyle: pointStyle,
    });
  }
  return result;
});

function getAxisID(index: number) {
  if (index === 0) {
    return "y";
  } else {
    return `y${index}`;
  }
}

const labelCallback = computed(
  () =>
    function (context: TooltipItem<"line">) {
      let label = context.dataset.label || "";

      if (label) {
        label += ": ";
      }
      if (context.parsed.y !== null) {
        let digits = Math.floor(Math.log10(100 / context.parsed.y));
        digits = digits == Infinity ? 0 : Math.max(digits, 2);
        digits = Number.isNaN(digits) ? 0 : digits;
        label += new Intl.NumberFormat(i18nLocale.locale.value, {
          maximumFractionDigits: digits,
        }).format(context.parsed.y);
      }
      if (props.units && props.units[context.datasetIndex]) {
        label += ` ${props.units[context.datasetIndex]}`;
      }
      return label;
    },
);

const tooltipTitleCallback = useTooltipTitleCallback();
const tooltipFooterCallback = useTooltipFooterCallback();

/**
 * These options are used to configure the chart
 */
const chartOptions = computed(() => {
  const scales: Record<string, any> = {
    x: scaleOptionsX.value,
    y: {
      ...scaleOptionsY.value,
      ticks: { callback: createTickCallback(props.units[0]), color: colors.value[0] },
    },
  };

  if (props.type.length > 1 && !props.areYAxisMerged) {
    for (let i = 1; i < props.type.length; i++) {
      scales[`y${i}`] = {
        ...scaleOptionsY.value,
        ticks: {
          callback: createTickCallback(props.units[i]),
          color: colors.value[i % colors.value.length],
        },
        grid: {
          display: false,
        },
        position: i % 2 === 1 ? "right" : "left",
      };
    }
  }

  return {
    scales,
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    responsive: true,
    maintainAspectRatio: false,
    elements: { line: { tension: props.tension || 0.1 } },
    plugins: {
      legend: {
        labels: {
          color: tickColor.value,
          usePointStyle: true,
          pointStyle: "circle",
          generateLabels: function (chart) {
            return chart.data.datasets.map((dataset, i) => ({
              text: dataset.label,
              fillStyle: dataset.borderColor,
              strokeStyle: dataset.borderColor,
              lineWidth: 1,
            }));
          },
        },
        position: "bottom",
        // callback to hide scales and grid lines if series is unselected
        onClick: function (
          event: ChartEvent,
          legendItem: LegendItem,
          legend: LegendElement<"line">,
        ) {
          legend.chart.data.datasets[legendItem.datasetIndex!].hidden =
            !legend.chart.data.datasets[legendItem.datasetIndex!].hidden;

          if (props.areYAxisMerged) {
            legend.chart.update();
            return;
          }
          // hide/show y-scale of clicked dataset
          const y_axis_id = legend.chart.data.datasets[legendItem.datasetIndex!].yAxisID;
          const scaleAxis = legend.chart.options!.scales![y_axis_id!]!;
          scaleAxis.display = !scaleAxis.display;

          // find first visible dataset
          let firstVisibleDataset = 0;
          for (let i = 0; i < legend.chart.data.datasets.length; i++) {
            if (!legend.chart.data.datasets[i].hidden) {
              firstVisibleDataset = i;
              break;
            }
          }

          // find fist dataset where grid is displayed
          let firstVisibleGrid = 0;
          for (let i = 0; i < legend.chart.data.datasets.length; i++) {
            if (
              legend.chart.options.scales![legend.chart.data.datasets[i].yAxisID ?? 0]?.grid
                ?.display
            ) {
              firstVisibleGrid = i;
              break;
            }
          }

          // if grid is not visible on first dataset, set grid to visible on first visible dataset
          // and hide grid on firstVisibleGrid dataset
          if (firstVisibleDataset !== firstVisibleGrid) {
            legend.chart.options.scales![
              legend.chart.data.datasets[firstVisibleDataset].yAxisID!
            ]!.grid!.display = true;
            legend.chart.options.scales![
              legend.chart.data.datasets[firstVisibleGrid].yAxisID!
            ]!.grid!.display = false;
          }

          legend.chart.update();
        },
      },
      tooltip: {
        callbacks: {
          label: labelCallback.value,
          title: tooltipTitleCallback.value,
          footer: props.stacked ? tooltipFooterCallback.value : undefined,
        },
      },
      annotation: {
        annotations: {
          line1: threshold_line.value,
        },
      },
    },
    locale: i18nLocale.locale.value,
  };
});

function createTickCallback(unit: string) {
  return function (value: number) {
    const formatter = new Intl.NumberFormat(i18nLocale.locale.value, {
      maximumFractionDigits: 2,
    });
    return `${formatter.format(value)} ${unit}`;
  };
}

const maxTicksLimit = computed(() => {
  return periodConfigurations[props.period]?.maxTicksLimit ?? 24;
});

// All scale options are found here: https://www.chartjs.org/docs/latest/axes/
const scaleOptionsX = computed(() => ({
  type: "timeseries",
  max: props.scaleXMax,
  border: {
    display: false,
  },
  grid: {
    color: gridColor.value,
    drawOnChartArea: false,
    lineWidth: 1,
  },
  ticks: {
    font: {
      size: 11,
    },
    padding: 2,
    maxTicksLimit: maxTicksLimit.value,
    callback: (value) => {
      return Intl.DateTimeFormat(i18nLocale.locale.value, formatOptions.value).format(
        new Date(value),
      );
    },
  },
  stacked: props.stacked ?? false,
}));

const scaleOptionsY = computed(() => ({
  type: "linear",
  border: {
    display: false,
  },
  grid: {
    color: gridColor.value,
    lineWidth: 0.3,
    tickLength: 0,
  },
  ticks: {
    font: {
      size: 11,
    },
    padding: 2,
    // callback: createTickCallback(props.units[0]),s
  },
  stacked: props.stacked ?? false,
}));

// Formatting options based on period
const formatOptions = computed(() => {
  let options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  } as Intl.DateTimeFormatOptions;
  switch (props.period) {
    case Periods.LIVE:
      options = { second: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false };
      break;
    case Periods.HOUR:
      options = { hour: "2-digit", minute: "2-digit", hour12: false };
      break;
    case Periods.DAY:
      options = { hour: "2-digit", minute: "2-digit", hour12: false };
      break;
    case Periods.WEEK:
      options = { weekday: "short", day: "numeric", month: "short", hour12: false };
      break;
    case Periods.MONTH:
      options = { day: "numeric", month: "short", hour12: false };
      break;
    case Periods.YEAR:
      options = { month: "short", year: "2-digit", hour12: false };
      break;
    case Periods.LAST_HOUR:
      options = { hour: "2-digit", minute: "2-digit", hour12: false };
      break;
    case Periods.LAST_SIX_HOURS:
      options = { hour: "2-digit", minute: "2-digit", hour12: false };
      break;
    case Periods.LAST_TWENTYFOUR_HOURS:
      options = { hour: "2-digit", minute: "2-digit", hour12: false };
      break;
    case Periods.LAST_THREE_DAYS:
      options = { weekday: "short", day: "numeric", month: "short", hour12: false };
      break;
    case Periods.LAST_SEVEN_DAYS:
      options = { weekday: "short", day: "numeric", month: "short", hour12: false };
      break;
    case Periods.LAST_THIRTY_DAYS:
      options = { day: "numeric", month: "short", hour12: false };
      break;
    case Periods.LAST_NINETY_DAYS:
      options = { day: "numeric", month: "short", hour12: false };
      break;
    case Periods.LAST_YEAR:
      options = { month: "short", year: "2-digit", hour12: false };
      break;
    case Periods.LAST_FIVE_YEARS:
      options = { month: "short", year: "2-digit", hour12: false };
      break;
  }
  return options;
});

const { tm } = useI18n();
const threshold_line = computed(
  () =>
    props.thresholdValue != undefined && {
      type: "line",
      label: {
        content: tm("anomalyDetectionDescriptions.HistoryAnomalyDetection.table")[9].name,
        display: true,
      },
      xMin: labels.value[0],
      xMax: labels.value[labels.value.length - 1],
      yMin: props.thresholdValue,
      yMax: props.thresholdValue,
      borderColor: "rgb(255, 99, 132)",
      borderWidth: 2,
    },
);

function updateChart(index: number, value: number) {
  chart.value.chart.data.datasets[index].data.push({
    x: new Date(moment().unix() * 1000),
    y: value,
  });

  let count = 0;
  // lopp trough data set and increase count, until x is bigger than now - 15min
  // break loop and remove all data points before now - 15min
  for (let i = 0; i < chart.value.chart.data.datasets[index].data.length; i++) {
    if (
      moment(chart.value.chart.data.datasets[index].data[i].x).unix() * 1000 <
      moment().subtract(15, "minutes").unix() * 1000
    ) {
      count++;
    } else {
      break;
    }
  }

  // splice away the number of data points that are older than now - 15min
  chart.value.chart.data.datasets[index].data.splice(0, count);
  chart.value.chart.data.labels.splice(0, count);

  chart.value.chart.update();
}

defineExpose({ updateChart });

// Lifecycle Hooks
onBeforeMount(() => (uid.value = uuidv4()));
</script>
