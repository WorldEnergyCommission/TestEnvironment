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
      @mousedown="handlePlus"
    >
      <lynus-icon :name="icon" color="lynusText" size="24" />
    </CoreButton>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent Plus Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    isPushButtonBehavior: { default: false, type: Boolean },
    color: { default: "green", type: String },
    fab: { default: false, type: Boolean },
    icon: { default: "plus", type: String },
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
      /**
       * this variable is used to disable the Base component
       * if there is no variable set in the mappings of the device.
       */
      isNotMapped: false,
    };
  },
  created() {
    if (this.measurementsClean.commandPlus === "") {
      this.isNotMapped = true;
    }
  },
  methods: {
    handlePlus() {
      this.send([{ v: 1, n: this.measurementsClean.commandPlus, u: "" }]);
      this.send([{ v: 0, n: this.measurementsClean.commandPlus, u: "" }]);
    },
    down() {
      this.send([{ v: 1, n: this.measurementsClean.commandPlus, u: "" }]);
    },
    up() {
      this.send([{ v: 0, n: this.measurementsClean.commandPlus, u: "" }]);
    },
  },
});
</script>

<style lang="scss" scoped></style>
