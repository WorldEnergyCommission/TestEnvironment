<template>
  <!-- Disable eslint since @end is suppport in 3.2.0 but not updated in eslint rules-->
  <!-- eslint-disable vuetify/no-deprecated-events -->
  <CoreSlider
    :append-icon="appendIcon"
    :disabled="!isActive || isNotMapped"
    :max="maxSliderValue"
    :min="minSliderValue"
    :prepend-icon="prependIcon"
    :step="customStepSize"
    :model-value="sliderValue"
    class="slider-base"
    hide-details
    track-color="#dedede"
    @end="handleStateEnd"
    @update:model-value="handleState"
  />
  <!--eslint-enable-->
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent Slider Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    data: Object as PropType<any>,
    isActive: {
      type: Boolean,
    },
    state: {
      type: Number,
    },
    appendIcon: { default: null, type: String },
    prependIcon: { default: null, type: String },
    sendingTimeout: { default: 250, type: Number },
    endTimeout: { default: 10000, type: Number },
    minSliderValue: { default: 0, type: Number },
    maxSliderValue: { default: 100, type: Number },
    customStepSize: { default: 1, type: Number },
  },
  data() {
    const sliderValue: any = null;
    const valueChangingTimer: any = undefined;
    const timer2: any = undefined;

    return {
      timer2,
      valueChangingTimer,
      sliderValue,
      isSliderValueChanging: false,
      isSliderValueChangingWithTimeout: false,
      /**
       * this variable is used to disable the Base component
       * if there is no variable set in the mappings of the device.
       */
      isNotMapped: false,
    };
  },
  watch: {
    isActive: [
      {
        handler: "onDimmerOff",
      },
    ],
    state: [
      {
        handler: "onStateChange",
      },
    ],
    isSliderValueChangingWithTimeout: [
      {
        handler: "onSliderValueChangingWithTimeout",
      },
    ],
    isSliderValueChanging: [
      {
        handler: "onSliderValueChanging",
      },
    ],
  },
  created() {
    if (this.measurementsClean.targetValue === "") {
      this.isNotMapped = true;
    }
  },
  mounted() {
    this.sliderValue = this.state;
    this.isSliderValueChanging = false;
    this.isSliderValueChangingWithTimeout = false;
  },
  beforeUnmount() {
    clearInterval(this.timer2);
  },
  methods: {
    handleStateEnd() {
      this.send([{ v: this.sliderValue, n: this.measurementsClean.targetValue, u: "" }]);
      this.isSliderValueChanging = false;
      this.valueChangingTimer = setTimeout(() => {
        this.isSliderValueChangingWithTimeout = false;
      }, this.endTimeout);
    },
    handleState(value: number) {
      this.sliderValue = value;
      clearInterval(this.valueChangingTimer);
      if (typeof this.state === "number" && this.state !== this.sliderValue) {
        this.isSliderValueChanging = true;
        this.isSliderValueChangingWithTimeout = true;
      }
    },
    onDimmerOff(val: boolean) {
      if (val) {
        this.sliderValue = this.state;
      }
      if (!val) {
        clearInterval(this.valueChangingTimer);
        this.isSliderValueChangingWithTimeout = false;
        this.sliderValue = 0;
      }
    },
    onStateChange(val: any) {
      if (this.state === undefined) {
        this.isNotMapped = true;
      }
      if (!this.isSliderValueChangingWithTimeout) this.sliderValue = val;
    },
    onSliderValueChangingWithTimeout(val: boolean) {
      if (!val) this.sliderValue = this.state;
    },
    onSliderValueChanging(val: boolean) {
      if (val) {
        this.timer2 = setInterval(() => {
          this.send([{ v: this.sliderValue, n: this.measurementsClean.targetValue, u: "" }]);
        }, this.sendingTimeout);
      }
      if (!val) {
        clearInterval(this.timer2);
      }
    },
  },
});
</script>

<style lang="scss">
.slider-base {
  .v-input__prepend-outer {
    margin-right: 0 !important;
  }

  .v-input__append-outer {
    margin-left: 0 !important;
  }
}
</style>
