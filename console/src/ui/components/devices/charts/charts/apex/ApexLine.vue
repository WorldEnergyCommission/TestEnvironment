<template>
  <div ref="chart" class="apex-chart-container" />
</template>

<script setup lang="ts">
import ApexCharts, { ApexOptions } from "apexcharts";
import { onMounted, ref } from "vue";

import { PropsApexLine } from "./ApexModel";

// Properties
const props = withDefaults(defineProps<PropsApexLine>(), {
  min: 0,
  max: 100,
});

// Refrences the chart element in the template
const chart = ref(null);

// Life Cycle Hooks
onMounted(() => {
  // Creates the ApexOptions from the props provided
  const options: ApexOptions = {
    chart: { type: "line" },
    series: [{ name: props.name, data: props.data }],
    xaxis: { categories: props.categories },
    yaxis: { max: props.max, min: props.min },
    stroke: { curve: "smooth" },
    markers: { size: 0, colors: "green" },
  };

  // Creates an instance of apexcharts
  const apexChart = new ApexCharts(chart.value, options);

  // Renders the created instance
  apexChart.render();
});
</script>

<style scoped lang="scss">
.apex-chart-container {
  width: 80%;
}
</style>
