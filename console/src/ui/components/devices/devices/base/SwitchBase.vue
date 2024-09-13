<template>
  <CoreSwitch
    :disabled="isNotMapped"
    :model-value="state"
    hide-details
    inset
    @click.capture="handleState($event)"
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent Switch Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  data() {
    const timer: any = undefined;

    return {
      timer,
      /**
       * this variable is used to disable the Base component
       * if there is no variable set in the mappings of the device.
       */
      isNotMapped: false,
      previewSwitchState: false,
    };
  },
  computed: {
    /**
     * Returns state status according to variables values
     * @return {boolean} state status
     */
    state(): boolean {
      if (
        this.measurementsClean.off === "" &&
        this.measurementsClean.on === "" &&
        this.measurementsClean.state === ""
      ) {
        return false;
      }
      if (this.measurementsClean) {
        if (this.isPreview) {
          return !this.previewSwitchState;
        } else {
          return !!this.measurements.get(this.measurementsClean.state);
        }
      }
      return false;
    },
  },
  watch: {
    state: [
      {
        handler: "onChange",
      },
    ],
    measurementsClean: [{ handler: "mappingHandler" }],
  },
  created() {
    if (
      this.measurementsClean.off === "" &&
      this.measurementsClean.on === "" &&
      this.measurementsClean.state === ""
    ) {
      this.isNotMapped = true;
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer);
  },
  methods: {
    /**
     * If the current status is the same as the previous status launches fn1 then fn2
     * @param {boolean} snapshot state status snapshot
     * @param {function} fn1 switchOn or switchOff functions
     * @param {function} fn2 switchOn or switchOff functions
     */
    timeoutFn(snapshot: any, fn1: any, fn2: any) {
      return setTimeout(() => {
        if (this.state === snapshot) {
          fn1();
          fn2();
        }
      }, 5000);
    },
    switchOn() {
      this.send([{ v: 1, n: this.measurementsClean.on, u: "" }]);
      this.send([{ v: 0, n: this.measurementsClean.on, u: "" }]);
    },
    switchOff() {
      this.send([{ v: 1, n: this.measurementsClean.off, u: "" }]);
      this.send([{ v: 0, n: this.measurementsClean.off, u: "" }]);
    },
    handleState(event: MouseEvent) {
      // https://stackoverflow.com/q/51000149
      event.stopPropagation();
      event.preventDefault();

      if (this.isPreview) {
        this.previewSwitchState = !this.previewSwitchState;
        return;
      }

      const stateSnapshot = this.state;
      if (this.state) {
        this.switchOff();
        this.timer = this.timeoutFn(stateSnapshot, this.switchOn, this.switchOff);
      } else {
        this.switchOn();
        this.timer = this.timeoutFn(stateSnapshot, this.switchOn, this.switchOff);
      }
    },
    onChange(val: boolean) {
      clearTimeout(this.timer);
      // TODO: add watcher
    },
    mappingHandler() {
      if (
        this.measurementsClean.off !== "" &&
        this.measurementsClean.on !== "" &&
        this.measurementsClean.state !== ""
      ) {
        this.isNotMapped = false;
      }
    },
  },
});
</script>
