<template>
  <div style="display: flex; justify-content: space-between">
    <div
      v-if="showNumberValue === true"
      style="padding-top: 2px; width: 30px; display: flex; justify-content: flex-end"
    >
      {{ currentValue }}
    </div>
    <div v-if="showNumberValue === true && currentValue !== undefined" style="padding-top: 2px">
      %
    </div>
    <lynus-icon :color="iconColorErrorWarning" :name="currentIcon" size="30" />
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";

/**
 * Component that represent StatusIcon Basic Control
 */
export default defineComponent({
  extends: BaseDevice,
  props: {
    iconMapping: Object as PropType<any>,
    showNumberValue: { default: false, type: Boolean },
    setErrorWarningColorSwitch: { default: false, type: Boolean },
    errorValue: { default: 2, type: Number },
    warningValue: { default: 1, type: Number },
    okValue: { default: 0, type: Number },
    min: { default: -1, type: Number },
    max: { default: 100, type: Number },
  },
  data() {
    return {
      items: Object.keys(this.iconMapping).map((key: string) => {
        return {
          name: this.iconMapping[key],
          value: key,
        };
      }),
      tempName: "",
    };
  },
  computed: {
    currentValue(): any {
      const resultCurrentValue: any = this.measurements.get(this.measurementsClean.currentValue);
      if (resultCurrentValue >= this.max) {
        return this.max;
      } else if (resultCurrentValue <= this.min) {
        return this.min;
      }
      return this.measurements.get(this.measurementsClean.currentValue);
    },
    /**
     * gets Current Icon for status bar
     */
    currentIcon() {
      Object.entries(this.items).forEach((object: any, index: number) => {
        // input number > lowest Value && input number < highestValue
        if (this.currentValue >= object[1].name[0] && this.currentValue <= object[1].name[1]) {
          this.tempName = object[1].value;
          return object[1].value;
        }
      });
      // if value = undefined than the first Icon of the mapping will be shown
      if (this.currentValue === undefined) {
        return this.items[0].value;
      }
      return this.tempName;
    },
    iconColorErrorWarning() {
      if (this.setErrorWarningColorSwitch === true) {
        if (this.currentValue === this.errorValue) {
          return "red";
        } else if (this.currentValue === this.warningValue) {
          return "warning";
        }
      }
      return "theme";
    },
  },
});
</script>
