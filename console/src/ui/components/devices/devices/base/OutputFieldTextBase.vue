<template>
  <div>
    {{ actualValue }}
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent OutputFieldText Basic Control
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
  },
  computed: {
    actualValue(): any {
      let returnText: any = this.checkFallbackText();
      // cut String at max lenght
      returnText = returnText.substring(0, this.max);
      return returnText;
    },
  },
  methods: {
    checkFallbackText() {
      if (typeof this.measurements.get(this.measurementsClean.actualValue) === "string") {
        return this.measurements.get(this.measurementsClean.actualValue);
      } else {
        return "No Text";
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
