<template>
  <div class="stream-anomaly-detection">
    <DeviceCardWrapper>
      <template #title>
        {{ deviceData?.name }}
      </template>
      <template #actions>
        <DeviceActions :device="deviceData" @chart-change="onChange" />
      </template>
      <template #content>
        <BaseChart
          :chart-data="deviceData"
          :chart-height="423"
          :threshold-value="deviceData?.data?.threshold"
          :min-number-of-series-for-wide-chart="4"
          :show-total-of-series="true"
          :show-time-selection="false"
          :show-device-actions="false"
          :is-preview="isPreview"
          :on-edit-trigger="onEditTrigger"
          @handle-autarkiegrad="$emit('handleAutarkiegrad', $event)"
        />
      </template>
    </DeviceCardWrapper>
    <div class="device-dnd-button">
      <slot name="dnd" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import DeviceActions from "@/ui/components/devices/actions/DeviceActions.vue";
import BaseChart from "@/ui/components/devices/charts/charts/BaseChart.vue";
import DeviceCardWrapper from "@/ui/components/devices/layout/DeviceCardWrapper";

/**
 * Stream anomaly detection device
 */
export default defineComponent({
  components: {
    BaseChart,
    DeviceCardWrapper,
    DeviceActions,
  },
  props: {
    deviceData: Object as PropType<IDevice>,
    isPreview: { default: false, type: Boolean },
  },
  emits: ["handleAutarkiegrad"],
  data() {
    return {
      onEditTrigger: false,
    };
  },
  methods: {
    onChange() {
      this.onEditTrigger = !this.onEditTrigger;
    },
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";

.stream-anomaly-detection {
  position: relative;
  overflow: hidden;

  .device-dnd-button {
    position: absolute;
    bottom: 5px;
    right: 5px;
  }
}
</style>
