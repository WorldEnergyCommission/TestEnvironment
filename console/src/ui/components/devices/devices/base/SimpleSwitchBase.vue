<template>
  <CoreTooltip v-if="isNotMapped" location="bottom">
    <template #activator="{ props }">
      <div v-bind="props">
        <CoreSwitch disabled :model-value="defaultValue" :label="label" hide-details inset />
      </div>
    </template>
    <span> {{ $t("uiComponents.deviceActions.missingVariable") }} </span>
  </CoreTooltip>
  <CoreSwitch
    v-else
    :model-value="state"
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
 * Component that represent SimpleSwitchBase Basic Control
 * it only uses the variabel onOff for its state, as well to set values
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
      if (this.measurementsClean.onOff === "") {
        return false;
      }
      if (this.isPreview) {
        return !this.previewSwitchState;
      }
      if (this.measurementsClean && Object.entries(this.measurementsClean).length !== 0) {
        return !!this.measurements.get(this.measurementsClean.onOff);
      }
      return null;
    },
    isNotMapped() {
      if (
        !this.measurementsClean ||
        Object.entries(this.measurementsClean).length === 0 ||
        this.measurementsClean.onOff === ""
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
