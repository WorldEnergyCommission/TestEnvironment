<template>
  <CoreButton
    :disabled="isNotMapped"
    size="small"
    button-type="standardIcon"
    @mousedown="down"
    @mouseup="up"
  >
    <lynus-icon :name="icon" color="lynusText" size="24" />
  </CoreButton>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent Pause Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    color: { default: "#7c7c7c", type: String },
    icon: { default: "pause", type: String },
  },
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
    if (this.measurementsClean.commandPause === "") {
      this.isNotMapped = true;
    }
  },
  methods: {
    down() {
      this.send([{ v: 1, n: this.measurementsClean.commandPause, u: "" }]);
    },
    up() {
      this.send([{ v: 0, n: this.measurementsClean.commandPause, u: "" }]);
    },

    handleIsMapped() {
      if (this.measurementsClean.commandPause !== "") {
        this.isNotMapped = false;
      }
      this.isNotMapped = true;
    },
  },
});
</script>

<style lang="scss" scoped></style>
