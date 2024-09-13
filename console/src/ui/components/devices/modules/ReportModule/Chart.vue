<template>
  <Bar
    :id="uid"
    ref="bar"
    :data="chartData"
    :options="chartOptions"
    style="max-height: 500px"
    :plugins="plugins"
  />
</template>

<script lang="ts" setup>
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  Colors,
  PointElement,
  LinearScale,
  LineElement,
  LineController,
  TooltipItem,
} from "chart.js";
import tinycolor from "tinycolor2";
import { v4 as uuidv4 } from "uuid";
import { computed, ref, onBeforeMount } from "vue";
import { Bar } from "vue-chartjs";
import { useI18n } from "vue-i18n";
import { useTheme, useDisplay } from "vuetify";

import ChartColors from "../../charts/charts/ChartColors";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  Colors,
  PointElement,
  LineElement,
  LineController,
);

const props = defineProps<{
  data: Record<string, number>[];
  titles: string[];
  types: string[];
  yAxisis: string[];
  units?: string[];
  labels?: string[];
  legendPosition?: string;
  disableSeparator?: boolean;
}>();

const { current: theme } = useTheme();
const { mobile } = useDisplay();
const i18nLocale = useI18n();

const uid = ref("");
onBeforeMount(() => (uid.value = uuidv4()));

const tickColor = computed(() => (theme.value.dark ? "#ffffff" : "#000000"));

const commonScaleOptions = {
  ticks: {
    color: tickColor.value,
    beginAtZero: false,
  },
  grid: {
    display: false,
  },
  border: {
    display: false,
  },
  drawBorder: false,
};

function formatDateShort(val, index) {
  // if (props.labels) return props.labels[val];
  return Intl.DateTimeFormat(i18nLocale.locale.value, { dateStyle: "short" }).format(
    x_values.value[val],
  );
}

// Convert a hex string to an rgba string with given opacity
// See: https://stackoverflow.com/a/21648508
function hexToRgbA(hex: string, opacity: number) {
  let c;
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    c = hex.substring(1).split("");
    if (c.length == 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return "rgba(" + [(c >> 16) & 255, (c >> 8) & 255, c & 255].join(",") + "," + opacity + ")";
  }
  throw new Error("Bad Hex");
}

const segmentLine = {
  id: "segmentLine",
  beforeDatasetsDraw(chart: ChartJS<"bar">) {
    const {
      ctx,
      scales: { x, y1 },
      height,
    } = chart;

    ctx.save();

    if (x && x.type == "category") {
      for (let i = 0; i < x.ticks.length; i++) {
        let xCoor = x.getPixelForValue(i);
        const secondXIndex = i < x.ticks.length - 1 ? 1 : -1;
        const x2Coor = x.getPixelForValue(i + secondXIndex);
        xCoor += (x2Coor - xCoor * 1) / 2;

        const offsetX = 25;
        ctx.beginPath();
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = hexToRgbA(theme.value.colors.accent, 0.35); //"rgba(0, 0, 0, 0.3)";
        ctx.moveTo(xCoor, offsetX);
        ctx.lineTo(xCoor, y1.height - offsetX);
        ctx.stroke();
      }
    }
  },
};

const plugins = computed(() => (props.disableSeparator ? [] : [segmentLine]));

const chartOptions = computed(() => {
  const xOptions = JSON.parse(JSON.stringify(commonScaleOptions));
  const yOptions = JSON.parse(JSON.stringify(commonScaleOptions));
  if (!props.labels && !(props.labels?.length > 0)) {
    (xOptions as any).ticks = { callback: formatDateShort };
  }
  // hide y scales
  (yOptions as any).display = false;
  const legendPosition = props.legendPosition ?? (mobile.value ? "bottom" : "right");
  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 50,
    plugins: {
      legend: {
        labels: {
          color: tickColor.value,
          usePointStyle: true,
        },
        position: legendPosition,
        onClick: function (e: Event) {
          e.stopPropagation();
        },
      },
      tooltip: {
        callbacks: {
          title: function (tooltipItems: TooltipItem<"bar">[]) {
            const firstDatasetIndex = tooltipItems[0].datasetIndex;
            const firstDataIndex = tooltipItems[0].dataIndex;
            const ts = Object.keys(props.data[firstDatasetIndex])[firstDataIndex];

            if (!ts) {
              return "";
            }

            const dat = new Date(Number(ts) * 1000);

            return Intl.DateTimeFormat(i18nLocale.locale.value, { dateStyle: "full" }).format(dat);
          },
          label: function (context: TooltipItem<"bar">) {
            let label = context.dataset.label || "";

            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat(i18nLocale.locale.value, {
                maximumFractionDigits: 1,
              }).format(Math.abs(context.parsed.y));
            }
            if (props.units && props.units[context.datasetIndex]) {
              label += ` ${props.units[context.datasetIndex]}`;
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: xOptions,
      y1: yOptions,
      y2: yOptions,
    },
    interaction: {
      mode: "index",
    },
  };
});

const x_values = computed(() => {
  if (props.labels) return props.labels;
  return props.data[0] ? Object.keys(props.data[0]).map((val) => new Date(1000 * Number(val))) : [];
});

const colors = computed(() => ChartColors.colors(theme.value.dark));

const datasets = computed(() =>
  props.data.map((val, index) => ({
    data: Object.values(val),
    label: props.titles[index],
    type: props.types[index],
    yAxisID: `y${props.yAxisis[index]}`,
    borderRadius: 12,
    borderSkipped: "start",
    borderColor: tinycolor(colors.value[index % colors.value.length])
      .setAlpha(0.6)
      .toRgbString(),
    backgroundColor: tinycolor(colors.value[index % colors.value.length])
      .setAlpha(0.6)
      .toRgbString(),
    fill: false,
  })),
);
const chartData = computed(() => {
  return {
    labels: x_values.value,
    datasets: datasets.value,
  };
});

const bar = ref();
const chart_js_instance = computed(() => (bar.value as any)?.chart);
defineExpose({ chart: chart_js_instance, bar: bar });
</script>
