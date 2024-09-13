<template>
  <CoreButton
    :color="state ? '#6CC1FF' : '#C4C4C4'"
    :disabled="isNotMapped"
    class="arrow-direction-right-base"
    elevation="0"
    rounded
    size="small"
    @mousedown="handleRight"
  >
    <lynus-icon color="white" name="arrow-direction-right" size="24" />
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent ArrowDirectionRight Basic Control
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
    if (this.measurementsClean.state === "" || this.measurementsClean.commandRight === "") {
      this.isNotMapped = true;
    }
  },
  methods: {
    handleRight() {
      this.send([{ v: 1, n: this.measurementsClean.commandRight, u: "" }]);
      this.send([{ v: 0, n: this.measurementsClean.commandRight, u: "" }]);
    },
    handleIsMapped() {
      if (this.measurementsClean.state !== "" && this.measurementsClean.commandRight !== "") {
        this.isNotMapped = false;
      }
      this.isNotMapped = true;
    },
  },
});
</script>

<style lang="scss" scoped>
.arrow-direction-right-base {
  background: #dedede;
}
</style>
