<template>
  <CoreCard
    :style="chartWrapperHeight ? `height: ${chartWrapperHeight}px` : ''"
    card-with-bg-color
    class="mpc-mqtt-chart"
  >
    <BaseChart
      :chart-data="chartData"
      :chart-height="chartHeight"
      :navigation-items-to-exclude="navigationItemsToExclude"
      :show-device-actions="false"
      :show-save-action="false"
      :is-preview="isPreview"
      @handle-autarkiegrad="$emit('handleAutarkiegrad', $event)"
    />
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import BaseChart from "@/ui/components/devices/charts/charts/BaseChart.vue";
import { ChartData } from "@/ui/components/devices/charts/charts/types";

/**
 * Component that represent wrapper for chart.
 * Used in MPC devices.
 */
export default defineComponent({
  components: {
    BaseChart,
  },
  props: {
    chartData: {
      type: Object as PropType<ChartData>,
    },
    chartHeight: { default: 400, type: Number },
    chartWrapperHeight: Number,
    navigationItemsToExclude: Object as PropType<any>,

    customApproximationValue: {
      default: () => ({ day: 4, week: 1, month: 1, year: 1 }),
      type: Object as PropType<any>,
    },
    isPreview: { default: false, type: Boolean },
  },
});
</script>

<style lang="scss"></style>
