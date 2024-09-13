<template>
  <div class="k2e-side-view-main">
    <!-- Index Indicator Part -->
    <div class="k2e-side-view-main-info">
      <div class="indexIndicator">
        {{ index }}
      </div>
      <div class="d-flex justify-space-between" style="width: 90%">
        <div>{{ socNegative }}</div>
        <div>{{ socPositive }}</div>
      </div>
    </div>
    <!-- Container Part -->
    <div class="k2e-side-view-main-content">
      <K2ESideCanvas :device-data="deviceData" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import K2ESideCanvas from "./K2ESideCanvas.vue";
import { RootState } from "@/store/types";

export default defineComponent({
  components: {
    K2ESideCanvas,
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
.k2e-side-view-main {
  height: 250px;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: rgb(var(--v-theme-primaryBorder)) 2px solid;
  padding: 8px;

  .k2e-side-view-main-info {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .k2e-side-view-main-content {
    width: 100%;
  }
}

.indexIndicator {
  display: flex;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  background-color: rgb(var(--v-theme-accent)) !important;
  justify-content: center;
  align-items: center;
  padding: 0 8px;
}
</style>
