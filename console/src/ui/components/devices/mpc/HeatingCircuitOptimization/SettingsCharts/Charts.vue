<template>
  <div class="mqtt-charts">
    <MLModelLynusChartWrapper :chart-data="tempValve" :is-preview="isPreview" />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MLModelLynusChartWrapper from "@/ui/components/devices/mpc/components/MLModelLynusChartWrapper.vue";

/**
 * Component that represent chart of actual data according to chosen period.
 */
export default defineComponent({
  components: {
    MLModelLynusChartWrapper,
  },
  props: {
    deviceId: String,
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const tab: any = null;

    return {
      tab,
    };
  },
  computed: {
    deviceIdMod() {
      if (this.deviceId) return this.deviceId.replace(/-/g, "_");
      return null;
    },
    /**
     * Prepares chart options object suitable for the chart component
     */
    tempValve() {
      return {
        name: "",
        data: {
          mappings: {
            value_1: `MPC.${this.deviceIdMod}.temp`,
            value_2: `MPC.${this.deviceIdMod}.valve`,
          },
          options: {
            value_1: {
              agg: "last",
              name: this.$t(
                "mlModel.HeatingCircuitOptimization.settingsView.chartLabels.chart.roomTemp",
              ),
              scaling: {
                max: 40,
                min: 0,
              },
              type: "line",
              unit: "°C",
            },
            value_2: {
              agg: "last",
              name: this.$t(
                "mlModel.HeatingCircuitOptimization.settingsView.chartLabels.chart.valvePosition",
              ),
              scaling: {
                max: 100,
                min: 0,
              },
              type: "line",
              unit: "%",
            },
          },
          selectedWidth: "full",
          type: "chart",
        },
      };
    },
  },
});
</script>

<style lang="scss">
.heating-circuit-optimization-charts {
  .mqtt-charts {
    min-height: 560px;
  }
}
</style>
