<template>
  <Line :id="uid" :data="chartData" :options="chartOptions" :plugins="chartPlugins" />
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  Title,
  CategoryScale,
  Colors,
  PointElement,
  LinearScale,
  LineElement,
  LineController,
} from "chart.js";
import { v4 as uuidv4 } from "uuid";
import { computed, onBeforeMount, ref } from "vue";
import { Line } from "vue-chartjs";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

// Plugins
const centerTextPlugin = computed(() => {
  const text = t("uiComponents.loader.loading") + " ...";
  return {
    id: "centerTextPlugin",
    afterDraw: (chart: ChartJS) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.font = "30px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const textX = chart.width / 2;
      const textY = chart.height / 2;
      ctx.fillText(text, textX, textY);
      ctx.restore();
    },
  };
});

const chartPlugins = computed(() => [centerTextPlugin.value]);

ChartJS.register(
  Title,
  CategoryScale,
  LinearScale,
  Colors,
  PointElement,
  LineElement,
  LineController,
);

// Id
const uid = ref("");

// Data
const chartData = computed(() => {
  return {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
    datasets: [
      {
        data: generateRandomArray(),
        label: "EfficientIO",
        type: "line",
        borderColor: "#D3D3D3",
        borderWidth: 8,
        pointStyle: false,
        tension: 0.3,
      },
    ],
  };
});

/**
 * These options are used to configure the chart
 * @constant xOptions - Options for the x axis
 * @constant yOptions - Options for the y axis
 */
const chartOptions = computed(() => {
  const xOptions = JSON.parse(JSON.stringify(scaleOptionsX.value));
  const yOptions = JSON.parse(JSON.stringify(scaleOptionsY.value));

  return {
    scales: {
      x: xOptions,
      y: yOptions,
    },
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 50,
    elements: { line: { tension: 0.1 } },
    plugins: {
      legend: {
        labels: {
          color: "#808080",
          usePointStyle: true,
        },
        position: "bottom",
      },
    },
    animations: {
      tension: {
        duration: 1000,
        easing: "linear",
        from: 1,
        to: 0.5,
        loop: true,
      },
    },
  };
});

// All scale options are found here: https://www.chartjs.org/docs/latest/axes/
const scaleOptionsX = computed(() => ({
  border: {
    display: false,
  },
  grid: {
    drawOnChartArea: false,
    lineWidth: 1,
  },
  ticks: {
    color: "#808080",
    font: {
      size: 11,
    },
    padding: 2,
    maxTicksLimit: 24,
  },
}));

const scaleOptionsY = computed(() => ({
  border: {
    display: false,
  },
  grid: {
    lineWidth: 0.3,
    tickLength: 10,
  },
  ticks: {
    color: "#808080",
    font: {
      size: 11,
    },
    padding: 2,
  },
}));

function generateRandomArray(): number[] {
  const randomArray: number[] = [];
  for (let i = 0; i < 12; i++) {
    const randomNumber = Math.floor(Math.random() * 11);
    randomArray.push(randomNumber);
  }
  return randomArray;
}

// Lifecycle Hooks
onBeforeMount(() => (uid.value = uuidv4()));
</script>
