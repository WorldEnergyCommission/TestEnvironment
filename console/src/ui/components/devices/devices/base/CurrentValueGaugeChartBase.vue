<template>
  <div class="gaugeNormal">
    <Gauge :options="options" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import Gauge from "@/ui/components/components/Gauge.vue";
import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent CurrentValueGaugeChart Basic Control
 */
export default defineComponent({
  components: { Gauge },
  extends: BaseDevice,
  props: {
    scaling: {
      type: Object as PropType<{
        max: number | string;
        min: number | string;
      }>,
      required: true,
    },
    unit: { default: "unit", type: String },
    isDecimal: { default: false, type: Boolean },
    isPreview: { default: false, type: Boolean },
  },
  computed: {
    options() {
      return {
        hasNeedle: false,
        rangeLabel: [this.scaling.min, this.scaling.max],
        arcDelimiters: [this.defineArcDelimiters],
        centralLabel: `${this.rounded}${this.unit}`,
        arcColors: [this.$vuetify.theme.current.colors.accent, "lightgray"],
      };
    },
    actualValue(): any {
      return this.measurements.get(this.measurementsClean.actualValue);
    },
    rounded() {
      if (!this.isDecimal) return Math.round(this.actualValue);
      return this.actualValue?.toFixed(2) ?? 0;
    },
    filteredValue() {
      if (this.rounded < +this.scaling.min) return +this.scaling.min;
      if (this.rounded > +this.scaling.max) return +this.scaling.max;
      return this.rounded;
    },
    defineArcDelimiters() {
      const arcState: number = this.filteredValue * (100 / parseInt(this.scaling.max, 10));
      if (arcState === 0) return 0.01;
      else if (arcState === 100) return 99.99;
      else return arcState;
    },
  },
});
</script>

<style lang="scss">
.gaugeNormal {
  width: 100%;
  height: 100%;
  padding-left: 20px;
  display: flex;
  justify-content: center;
  fill: rgb(var(--v-theme-lynusText));
  overflow: hidden;

  .gauge-preview-data-label {
    span {
      font-size: 25px;
      color: rgb(var(--v-theme-lynusText));
    }
  }
}
</style>
