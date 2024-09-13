<template>
  <CoreButton
    :color="state ? '#6CC1FF' : '#C4C4C4'"
    :disabled="isNotMapped"
    class="arrow-direction-left-base"
    elevation="0"
    rounded
    size="small"
    @mousedown="handleLeft"
  >
    <lynus-icon color="white" name="arrow-direction-left" size="24" />
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent ArrowDirectionLeft Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  data() {
    return {
      /**
       * this variable is used to disable the Base component
       * if there is no variable set in the mappings of the device.
       */
      isNotMapped: false,
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
    if (this.measurementsClean.state === "" || this.measurementsClean.commandLeft === "") {
      this.isNotMapped = true;
    }
  },
  methods: {
    handleLeft() {
      this.send([{ v: 1, n: this.measurementsClean.commandLeft, u: "" }]);
      this.send([{ v: 0, n: this.measurementsClean.commandLeft, u: "" }]);
    },
    handleIsMapped() {
      if (this.measurementsClean.state !== "" && this.measurementsClean.commandLeft !== "") {
        this.isNotMapped = false;
      }
      this.isNotMapped = true;
    },
  },
});
</script>

<style lang="scss" scoped>
.arrow-direction-left-base {
  background: #dedede;
}
</style>
