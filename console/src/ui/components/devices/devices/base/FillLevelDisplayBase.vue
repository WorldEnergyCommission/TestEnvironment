<template>
  <div>
    <CoreProgressLinear
      :color="costumBarColor"
      :height="costumHeight"
      :model-value="fieldFilteredValue"
      bg-color="primaryBorder"
      class="fill-level-display-base"
      rounded
    >
      <template v-if="isText" #default>
        <div>{{ filteredValue }}%</div>
      </template>
    </CoreProgressLinear>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent FillLevelDisplay Basic Control
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
    costumBarColor: { default: "accent", type: String },
    costumHeight: { default: 30, type: Number },
    isText: { default: false, type: Boolean },
    isPreview: { default: false, type: Boolean },
  },
  computed: {
    actualValue(): any {
      return this.measurements.get(this.measurementsClean.actualValue);
    },
    /**
     * Round actualValue
     */
    rounded() {
      if (!this.isDecimal) return Math.round(this.actualValue);

      return +`${Math.round(+`${this.actualValue}e+2`)}e-2`;
    },
    /**
     * round up the value if it is out of range
     */
    filteredValue() {
      if (this.min && this.rounded < this.min) return this.min;
      if (this.max && this.rounded > this.max) return this.max;
      return this.rounded;
    },
    fieldFilteredValue() {
      if (this.max) return (this.rounded * 100) / this.max;
      return this.rounded;
    },
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.fill-level-display-base {
  .v-progress-linear__determinate {
    border-radius: 0 $border-radius-root $border-radius-root 0 !important;
  }

  .v-progress-linear__content {
    color: #525252;
  }
}

.v-progress-linear--rounded {
  border-radius: $border-radius-root !important;
}
</style>
