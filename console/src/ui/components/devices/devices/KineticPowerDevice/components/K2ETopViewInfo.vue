<template>
  <div class="d-flex justify-space-around flex-wrap pt-2 k2e-top-view-info" style="width: 100%">
    <div class="information-part-settings">
      <span>{{ $t("devices.KineticPower.mappings.stateReady") }}:</span>
      <span class="pl-1">{{ stateReadyText }}</span>
    </div>
    <div class="information-part-settings">
      <span>{{ $t("devices.KineticPower.mappings.stateActive") }}:</span>
      <span class="pl-1">{{ stateActiveText }}</span>
    </div>
    <div class="information-part-settings">
      <span>{{ $t("devices.KineticPower.mappings.errorWarningState") }}:</span>
      <span class="pl-1">{{ errorWarningStateText }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { RootState } from "@/store/types";

export default defineComponent({
  props: {
    deviceData: Object as PropType<any>,
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    textOnOff() {
      return {
        0: this.$t("devices.KineticPower.mainView.textOnOffMappings.off"),
        1: this.$t("devices.KineticPower.mainView.textOnOffMappings.on"),
      };
    },
    textErrorWarning() {
      return {
        0: this.$t("devices.KineticPower.mainView.textErrorWarningMappings.ok"),
        1: this.$t("devices.KineticPower.mainView.textErrorWarningMappings.warning"),
        2: this.$t("devices.KineticPower.mainView.textErrorWarningMappings.error"),
      };
    },
    /**
     * returns the right text to show for stateReady
     */
    stateReadyText() {
      const val: any = this.measurements.get(this.deviceData.stateReady);
      const localTextOnOff: any = this.textOnOff;
      return localTextOnOff[val];
    },
    /**
     * returns the right text to show for stateActive
     */
    stateActiveText() {
      const val: any = this.measurements.get(this.deviceData.stateActive);
      const localTextOnOff: any = this.textOnOff;
      return localTextOnOff[val];
    },
    errorWarningStateText() {
      const val: any = this.measurements.get(this.deviceData.errorWarningState);
      const textMapping: any = this.textErrorWarning;
      return textMapping[val];
    },
  },
});
</script>

<style lang="scss">
.k2e-top-view-info {
  .information-part-settings {
    line-height: 1;
    width: 320px;
  }
}
</style>
