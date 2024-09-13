<template>
  <div id="chartDiv" ref="chartDiv" class="gauge mt-6">
    <Gauge :options="options" />
  </div>
</template>

<script lang="ts">
import { GaugeOptions } from "gauge-chart";
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import Gauge from "@/ui/components/components/Gauge.vue";
import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent gauge chart for PVMonitoringService.
 */
export default defineComponent({
  components: { Gauge },
  extends: BaseDevice,
  props: {
    deviceData: { type: Object as PropType<IDevice>, required: true },
    inputVariable: {
      type: String,
    },
  },
  computed: {
    options() {
      return {
        arcLabels: ["25%", "50%", "75%"],
        needleValue: this.actualValue,
        needleColor: "black",
        needleStartValue: 0,
        hasNeedle: true,
        rangeLabel: ["0", "100"],
        arcDelimiters: [25, 50, 75],
        chartWidth: null,
        arcColors: [
          `${this.$vuetify.theme.current.colors.error}`,
          `${this.$vuetify.theme.current.colors.error}`,
          "#FF9800",
          "#30BF54",
        ],
      } as GaugeOptions;
    },
    actualValue() {
      if (!this.inputVariable) return null;
      return this.measurements.get(this.inputVariable);
    },
  },
});
</script>

<style lang="scss" scoped>
.gauge {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  fill: rgb(var(--v-theme-lynusText));

  .gauge-preview-data-label {
    span {
      font-size: 25px;
      color: rgb(var(--v-theme-lynusText));
    }
  }
}
</style>
