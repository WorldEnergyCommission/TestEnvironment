<template>
  <CoreButton
    :class="['arrow-up-base', { active: state }]"
    :disabled="isNotMapped"
    :variant="state && 'outlined'"
    :small="small"
    color="#dedede"
    elevation="0"
    rounded
    @mousedown="up"
  >
    <lynus-icon color="white" name="arrow-2_up" />
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent ArrowUp Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    small: { default: false, type: Boolean },
  },
  data() {
    const timer: any = undefined;

    return {
      /**
       * this variable is used to disable the Base component
       * if there is no variable set in the mappings of the device.
       */
      isNotMapped: false,
      timer,
    };
  },
  computed: {
    state() {
      if (this.measurementsClean) {
        return !!this.measurements.get(this.measurementsClean.state);
      }
      return null;
    },
  },
  watch: {
    measurementsClean: [
      {
        handler: "handleIsMapped",
      },
    ],
  },
  created() {
    if (this.measurementsClean.state === "" || this.measurementsClean.up === "") {
      this.isNotMapped = true;
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
  methods: {
    up() {
      this.send([{ v: 1, n: this.measurementsClean.up, u: "" }]);
      this.send([{ v: 0, n: this.measurementsClean.up, u: "" }]);
    },
    handleIsMapped() {
      if (this.measurementsClean.state !== "" || this.measurementsClean.up !== "") {
        this.isNotMapped = false;
      }
      this.isNotMapped = true;
    },
  },
});
</script>

<style lang="scss" scoped>
.arrow-up-base {
  background: #c4c4c4;
}

.active {
  background: #6cc1fe !important;
}
</style>
