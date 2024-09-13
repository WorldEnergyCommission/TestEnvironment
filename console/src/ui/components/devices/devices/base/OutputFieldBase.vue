<template>
  <div>
    {{ localisation }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent OutputField Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    min: {
      type: Number,
    },
    max: {
      type: Number,
    },
    isDecimal: { default: false, type: Boolean },
    disableMinMaxFilter: { default: false, type: Boolean },
  },
  computed: {
    actualValue(): any {
      return this.measurements.get(this.measurementsClean.actualValue);
    },
    /**
     * Round number
     */
    mod() {
      if (!this.isDecimal) return Math.round(this.actualValue);

      return +`${Math.round(+`${this.actualValue}e+3`)}e-3`;
    },
    /**
     * Left maximum two numbers after comma
     */
    filtered(): any {
      return Number.isInteger(this.mod) ? this.mod : this.mod.toFixed(2);
    },
    /**
     * Converting number to locale format
     */
    localisation() {
      const filteredByMinMax = () => {
        if (this.min && this.min > +this.filtered) return this.min;
        if (this.max && this.max < +this.filtered) return this.max;
        return this.filtered;
      };
      if (this.disableMinMaxFilter === false) {
        if (filteredByMinMax() !== "NaN") {
          return Intl.NumberFormat("de-GE").format(filteredByMinMax());
        } else {
          return 0;
        }
      } else {
        return this.filtered;
      }
    },
  },
});
</script>
