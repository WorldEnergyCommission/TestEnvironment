<template>
  <DeviceLayout
    :device-data="deviceData"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
    @rerender-device="rerenderDevice"
  >
    <template #basic-controls>
      <div class="gauge">
        <CurrentValueGaugeChartBase
          :device-data="deviceData"
          :is-decimal="true"
          :rerender-key="rerenderKey"
          :scaling="scaling"
          :unit="unit"
          :is-preview="isPreview"
          :variable-data="deviceData.data.mappings"
          instance="CurrentValueGaugeChart"
          @handle-rerender-key="handleRerenderKey"
        />
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import CurrentValueGaugeChartBase from "@/ui/components/devices/devices/base/CurrentValueGaugeChartBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent Gauge device
 */
export default defineComponent({
  components: {
    CurrentValueGaugeChartBase,
    DeviceLayout,
  },
  extends: DeviceBase,
  props: {
    chartWidth: Number,
  },
  data() {
    return {
      rerenderKey: 0,
    };
  },
  computed: {
    unit() {
      return this.deviceData!.data.meta.unit;
    },
    scaling() {
      return this.deviceData!.data.meta.scaling;
    },
  },
  methods: {
    handleRerenderKey() {
      this.rerenderKey += 1;
    },
    rerenderDevice(data: any) {
      this.rerenderKey += 1;
    },
  },
});
</script>

<style lang="scss" scoped>
.gauge {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
