<template>
  <CoreSwitch
    :disabled="isNotMapped"
    :model-value="value"
    :label="label"
    hide-details
    inset
    @click.capture="handleState($event)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent Switch2V Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    label: { default: null, type: String },
    /**
     * if switch is not mapped, a default value that is shown disabled can be added
     */
    defaultValue: { default: undefined, type: Boolean },
  },
  data() {
    return {
      previewSwitchState: false,
    };
  },
  computed: {
    state() {
      if (this.measurementsClean.onOff === "" && this.measurementsClean.state === "") {
        return false;
      }
      if (this.isPreview) {
        return !this.previewSwitchState;
      }
      if (this.measurementsClean && Object.entries(this.measurementsClean).length !== 0) {
        return !!this.measurements.get(this.measurementsClean.state);
      }
      return null;
    },
    value() {
      if (this.defaultValue && this.isNotMapped) {
        return this.defaultValue;
      }
      return this.state;
    },
    isNotMapped() {
      if (
        !this.measurementsClean ||
        Object.entries(this.measurementsClean).length === 0 ||
        (this.measurementsClean.onOff === "" && this.measurementsClean.state === "")
      ) {
        return true;
      }
      return false;
    },
  },
  methods: {
    handleState(event: MouseEvent) {
      event.stopPropagation();
      event.preventDefault();

      if (this.isPreview) {
        this.previewSwitchState = !this.previewSwitchState;
      } else {
        this.send([{ v: +!this.state, n: this.measurementsClean.onOff, u: "" }]);
      }
    },
  },
});
</script>

<style lang="scss" scoped></style>
