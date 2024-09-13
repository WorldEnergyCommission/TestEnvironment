<template>
  <div class="battery-base">
    <div class="cap" />
    <div class="battery-body">
      <div class="content">
        <div class="value">{{ filteredValue }}{{ unit }}</div>
        <div :style="`width: ${fieldFilteredValue}%`" class="scale" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent Battery Basic Control
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
    unit: {
      type: String,
    },
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

<style lang="scss" scoped>
.battery-base {
  position: relative;
  width: 80%;
  height: 60%;

  .cap {
    content: "";
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    background: rgb(var(--v-theme-lynusText));
    left: 12px;
    top: 0;
    border-radius: 50%;
    z-index: 1;

    &::before {
      content: "";
      display: block;
      position: absolute;
      width: 100%;
      height: 100%;
      right: 10px;
      top: 0;
      z-index: 2;
      background: rgb(var(--v-theme-projectBackground));
      border-radius: 15px;
    }
  }

  .battery-body {
    width: 100%;
    height: 100%;
    border: 3px solid rgb(var(--v-theme-lynusText));
    background: rgb(var(--v-theme-projectBackground));
    border-radius: 15px;
    position: relative;
    z-index: 4;

    .content {
      width: calc(100% - 4px);
      height: calc(100% - 4px);
      background: transparent;
      border-radius: 8px;
      position: absolute;
      top: 2px;
      left: 2px;
      overflow: hidden;
      z-index: 3;
      display: flex;
      align-items: center;
      justify-content: center;

      .value {
        z-index: 1;
        font-size: 150%;
        color: #525252;
      }

      .scale {
        position: absolute;
        background: rgb(var(--v-theme-accent));
        top: 0;
        left: 0;
        height: 100%;
        border-radius: 10px;
      }
    }
  }
}
</style>
