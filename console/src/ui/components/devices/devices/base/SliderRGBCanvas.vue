<template>
  <div class="slider-rgb-canvas">
    <CoreColorPicker
      :disabled="isNotMapped"
      :model-value="sliderValue"
      variant="flat"
      hide-inputs
      @update:model-value="handleState"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

export default defineComponent({
  extends: BaseDevice,
  props: {
    isActive: {
      type: Boolean,
    },
    state: Object as PropType<any>,
  },
  data() {
    const sendingValues: any = [];
    const sliderValuesStorage: any = [];
    const sliderValue: any = {
      r: 255,
      g: 0,
      b: 0,
    };
    const valueChangingTimer: any = undefined;
    const timer2: any = undefined;

    return {
      timer2,
      valueChangingTimer,
      sliderValue,
      sliderValuesStorage,
      sendingValues,
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
    state: [{ deep: true, handler: "onStateChange" }],
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
    this.sliderValue = this.state;
    this.isSliderValueChanging = false;
    this.isSliderValueChangingWithTimeout = false;

    if (
      this.measurementsClean.targetValue_blue === "" ||
      this.measurementsClean.targetValue_green === "" ||
      this.measurementsClean.targetValue_red === ""
    ) {
      this.isNotMapped = true;
    }
  },
  beforeUnmount() {
    clearInterval(this.timer2);
  },
  methods: {
    handleState(value: any) {
      this.sliderValue = value;
      this.sliderValuesStorage.push(JSON.stringify(this.sliderValue));
      // clearInterval(this.valueChangingTimer);
      if (JSON.stringify(this.state) !== JSON.stringify(this.sliderValue)) {
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
        this.sliderValue = { r: 255, g: 0, b: 0 };
      }
    },
    onStateChange(val: any) {
      if (this.state === undefined) {
        this.isNotMapped = true;
      }
      // const isNull = JSON.stringify(val) === '{"r":0,"g":0,"b":0}';
      // if (!this.isSliderValueChangingWithTimeout && isNull) {
      //   this.sliderValue = { r: 255, g: 0, b: 0 };
      // }
      // if (!this.isSliderValueChangingWithTimeout && !isNull) {
      //   this.sliderValue = val;
      // }
      if (!this.isSliderValueChangingWithTimeout) {
        this.sliderValue = val;
      }
    },
    onSliderValueChangingWithTimeout(val: boolean) {
      if (!val) this.sliderValue = this.state;
    },
    onSliderValueChanging(val: boolean) {
      if (val) {
        clearInterval(this.valueChangingTimer);
        this.timer2 = setInterval(() => {
          const snapshot = JSON.stringify(this.sliderValue);
          this.sendingValues.push(snapshot);
          this.send([{ v: this.sliderValue.b, n: this.measurementsClean.targetValue_blue, u: "" }]);
          this.send([
            { v: this.sliderValue.g, n: this.measurementsClean.targetValue_green, u: "" },
          ]);
          this.send([{ v: this.sliderValue.r, n: this.measurementsClean.targetValue_red, u: "" }]);

          if (
            this.sliderValuesStorage[this.sliderValuesStorage.length - 1] ===
            this.sendingValues[this.sendingValues.length - 1]
          ) {
            this.isSliderValueChanging = false;
            this.sendingValues = [];
            this.sliderValuesStorage = [];
          }
        }, 350);
      }
      if (!val) {
        clearInterval(this.timer2);
        this.valueChangingTimer = setTimeout(() => {
          this.isSliderValueChangingWithTimeout = false;
        }, 10000);
      }
    },
  },
});
</script>

<style lang="scss">
.slider-rgb-canvas {
  display: flex;
  justify-content: center;

  .v-color-picker {
    &__controls {
      display: none !important;
    }
  }
}
</style>
