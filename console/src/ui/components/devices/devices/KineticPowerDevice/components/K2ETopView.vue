<template>
  <div class="d-flex flex-column k2e-top-view-main mt-3">
    <div class="k2e-top-view-main-content">
      <div class="index-indicator">
        {{ index }}
      </div>
      <div class="k2e-top-view-main-content-canvas">
        <div class="k2e-top-view-main-content-canvas-soc k2e-top-view-main-content-canvas-block">
          {{ socNegative }}
        </div>
        <div class="k2e-top-view-main-content-canvas-field k2e-top-view-main-content-canvas-block">
          <K2ETopCanvas :device-data="deviceData" class="flex-grow-1" />
        </div>
        <div class="k2e-top-view-main-content-canvas-soc k2e-top-view-main-content-canvas-block">
          {{ socPositive }}
        </div>
      </div>
    </div>
    <div class="k2e-top-view-main-info">
      <K2ETopViewInfo :device-data="deviceData" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { RootState } from "@/store/types";
import K2ETopCanvas from "@/ui/components/devices/devices/KineticPowerDevice/components/K2ETopCanvas.vue";
import K2ETopViewInfo from "@/ui/components/devices/devices/KineticPowerDevice/components/K2ETopViewInfo.vue";

export default defineComponent({
  components: {
    K2ETopCanvas,
    K2ETopViewInfo,
  },
  props: {
    deviceData: Object as PropType<any>,
    index: {
      type: Number,
    },
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    socNegative() {
      let val: any = parseInt(this.measurements.get(this.deviceData.socNegative) as any, 10);
      if (val !== undefined) {
        val = parseInt(val, 10).toFixed(2);
      }
      return `-${val} MWh`;
    },
    socPositive() {
      let val: any = parseInt(this.measurements.get(this.deviceData.socPositive) as any, 10);
      if (val !== undefined) {
        val = parseInt(val, 10).toFixed(2);
      }
      return `+${val} MWh`;
    },
  },
});
</script>

<style lang="scss" scoped>
.k2e-top-view-main {
  width: 100%;
  border: rgb(var(--v-theme-primaryBorder)) 2px solid;
  padding: 8px;

  .index-indicator {
    display: flex;
    border-radius: 50%;
    width: 26px;
    height: 26px;
    background-color: rgb(var(--v-theme-accent)) !important;
    justify-content: center;
    align-items: center;
  }

  .k2e-top-view-main-content {
    width: 100%;

    .k2e-top-view-main-content-canvas {
      width: 100%;
      height: 50px;

      .k2e-top-view-main-content-canvas-block {
        display: inline-block;
        height: 50px;
      }

      .k2e-top-view-main-content-canvas-field {
        width: calc(100% - 200px);
      }

      .k2e-top-view-main-content-canvas-soc {
        width: 100px;
        text-align: center;
        vertical-align: top;
        padding: 15px 0 0 0;
      }
    }
  }

  .k2e-top-view-main-info {
    width: 100%;
  }
}

.socValueStyles {
  width: 90px !important;
  margin: auto 0;
}
</style>
