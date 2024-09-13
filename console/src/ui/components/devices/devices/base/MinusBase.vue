<template>
  <div>
    <CoreButton
      v-if="isPushButtonBehavior"
      :disabled="isNotMapped"
      button-type="standardIcon"
      :[buttonSizeClass]="true"
      @mousedown="down"
      @mouseup="up"
    >
      <lynus-icon :name="icon" color="lynusText" size="24" />
    </CoreButton>
    <CoreButton
      v-else
      :disabled="isNotMapped"
      button-type="standardIcon"
      :[buttonSizeClass]="true"
      @mousedown="handleMinus"
    >
      <lynus-icon :name="icon" color="lynusText" size="24" />
    </CoreButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent Minus Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    isPushButtonBehavior: { default: false, type: Boolean },
    color: { default: "red", type: String },
    fab: { default: false, type: Boolean },
    icon: { default: "minus", type: String },
    /**
     * same as vuetify btn classes
     */
    buttonSizeClass: {
      default: "small",
      validator: (value: any): boolean =>
        [null, "x-small", "small", "large", "x-large"].some((el: string | null) => el === value),
      type: String,
    },
  },
  data() {
    return {
      isNotMapped: false,
    };
  },
  created() {
    if (this.measurementsClean.commandMinus === "") {
      this.isNotMapped = true;
    }
  },
  methods: {
    handleMinus() {
      this.send([{ v: 1, n: this.measurementsClean.commandMinus, u: "" }]);
      this.send([{ v: 0, n: this.measurementsClean.commandMinus, u: "" }]);
    },
    down() {
      this.send([{ v: 1, n: this.measurementsClean.commandMinus, u: "" }]);
    },
    up() {
      this.send([{ v: 0, n: this.measurementsClean.commandMinus, u: "" }]);
    },
  },
});
</script>

<style lang="scss" scoped></style>
