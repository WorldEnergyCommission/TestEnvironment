<template>
  <div class="show-event-dot-base">
    <div
      :style="`background: ${warningColor}; width: ${width}px; height: ${height}px`"
      class="show-event-dot-base-indicator"
    />
    <div v-if="activeMessage || inactiveMessage" class="show-event-dot-base-label pl-1">
      {{ errorStatus ? activeMessage : inactiveMessage }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent ShowEventDot Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    width: { default: 20, type: [String, Number] },
    height: { default: 20, type: [String, Number] },
    /**
     * example: [[1, red], [2, blue]]
     * default: [[251, "#30BF54"]]
     */
    items: {
      default() {
        return [[251, "#30BF54"]];
      },
      type: Array as PropType<any[]>,
    },
    /**
     * default: "#bebebe"
     */
    inactiveColor: { default: "#bebebe", type: String },
    activeMessage: { default: null, type: String },
    inactiveMessage: { default: null, type: String },
    /**
     * default: "errorWarningState"
     */
    mappingExtension: { default: "errorWarningState", type: String },
  },
  computed: {
    errorStatus() {
      return this.measurements.get(this.measurementsClean[this.mappingExtension]);
    },
    warningColor() {
      const map: any = new Map(this.items);
      return map.get(this.errorStatus) || this.inactiveColor;
    },
  },
});
</script>

<style lang="scss" scoped>
.show-event-dot-base {
  display: flex;

  .show-event-dot-base-indicator {
    border-radius: 50%;
  }
}
</style>
