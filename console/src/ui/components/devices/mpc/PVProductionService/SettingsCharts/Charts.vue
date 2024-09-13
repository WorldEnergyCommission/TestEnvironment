<template>
  <div class="pv-production-service-mqtt-charts">
    <MLModelLynusChartWrapper
      :chart-data="chartData.chartData"
      :chart-height="chartData.chartHeight"
      :chart-title="chartData.title"
      :navigation-items-to-exclude="chartData.navigationItemsToExclude"
      :use-default-period-configs="false"
      :is-preview="isPreview"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import MLModelLynusChartWrapper from "@/ui/components/devices/mpc/components/MLModelLynusChartWrapper.vue";

/**
 * Component that represent chart of actual data according to chosen period.
 */
export default defineComponent({
  components: {
    MLModelLynusChartWrapper,
  },
  props: {
    httpCharts: Object as PropType<any>,
    chartsScaling: [Object, Number, String],
    isPreview: { default: false, type: Boolean },
    mqttChartsVariables: {
      default: () => ({
        actualPower: "",
        calculatedPower: null,
        calculatedEnergy: null,
      }),
      type: Object as PropType<any>,
    },
  },
  data() {
    const tab: any = null;

    return {
      tab,
    };
  },
  computed: {
    langPath() {
      return "mlModel.PVProductionService.settingsView";
    },
    /**
     * Prepares chart options object suitable for the chart component
     */
    power() {
      return {
        name: "",
        data: {
          mappings: {
            value_1: this.mqttChartsVariables.actualPower,
            value_2: this.mqttChartsVariables.calculatedPower,
          },
          options: {
            value_1: {
              agg: "avg",
              name: this.$t(`${this.langPath}.chartLabels.power.actualPower`),
              scaling: {
                max: this.chartsScaling * 2,
                min: 0,
              },
              type: "line",
              unit: "kW",
            },
            value_2: {
              agg: "avg",
              name: this.$t(`${this.langPath}.chartLabels.power.calculatedPower`),
              scaling: {
                max: this.chartsScaling * 2,
                min: 0,
              },
              type: "line",
              unit: "kW",
            },
          },
          selectedWidth: "full",
          type: "chart",
        },
      };
    },
    chartData() {
      return {
        chartHeight: 600,
        chartData: this.power,
      };
    },
  },
});
</script>

<style lang="scss"></style>
