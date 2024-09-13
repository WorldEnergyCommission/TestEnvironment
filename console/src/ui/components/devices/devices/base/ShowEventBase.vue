<template>
  <div :class="[warningClass, 'show-event-base']" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent ShowEvent Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    warningState: {
      type: [Number, Object], // empty object
    },
  },
  computed: {
    errorStatus() {
      return this.measurements.get(this.measurementsClean.errorWarningState);
    },
    warningClass() {
      const state =
        this.warningState && this.warningState !== 0 ? this.warningState : this.errorStatus;
      if (state === 1) return "device-warning-state";
      if (state === 2) return "device-error-state";
      return null;
    },
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

@keyframes blinkRed {
  0% {
    border: 2px solid red;
  }
  50% {
    border: 2px solid transparent;
  }
  100% {
    border: 2px solid red;
  }
}

.device-error-state {
  animation-name: blinkRed;
  animation-duration: 4s;
  animation-timing-function: steps(1, end);
  animation-iteration-count: infinite;
}

@keyframes blinkOrange {
  0% {
    border: 2px solid orange;
  }
  50% {
    border: 2px solid transparent;
  }
  100% {
    border: 2px solid orange;
  }
}

.device-warning-state {
  animation-name: blinkOrange;
  animation-duration: 4s;
  animation-timing-function: steps(1, end);
  animation-iteration-count: infinite;
}

.show-event-base {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  border-radius: $border-radius-root;
}
</style>
