<template>
  <DeviceCardWrapper>
    <template v-if="chartData?.name" #title>
      {{ chartData.name }}
    </template>
    <template v-if="showDeviceActions" #actions>
      <DeviceActions :device="chartData" @chart-change="onChange" />
    </template>
    <template #content>
      <BaseChart
        :chart-data="chartData"
        :show-device-actions="false"
        :show-total-of-series="true"
        :is-preview="isPreview"
        :on-edit-trigger="onEditTrigger"
        class="flex-grow-1"
        style="min-height: 0; min-width: 0"
      />
      <div class="device-dnd-button">
        <slot name="dnd" />
      </div>
    </template>
  </DeviceCardWrapper>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import DeviceActions from "@/ui/components/devices/actions/DeviceActions.vue";
import BaseChart from "@/ui/components/devices/charts/charts/BaseChart.vue";
import { ChartData } from "@/ui/components/devices/charts/charts/types";
import DeviceCardWrapper from "@/ui/components/devices/layout/DeviceCardWrapper";

export default defineComponent({
  components: {
    BaseChart,
    DeviceCardWrapper,
    DeviceActions,
  },
  props: {
    chartData: {
      type: Object as PropType<ChartData>,
    },
    showDeviceActions: { default: true, type: Boolean },
    isPreview: { default: false, type: Boolean },
  },
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

.chart-wrapper {
  position: relative;
  overflow: hidden;
  outline: 1px solid rgb(var(--v-theme-lightBorder));

  &__header {
    height: 28px;
    font-size: 20px;
    line-height: 1;
  }

  &__body {
    border-radius: $border-radius-root;
    padding: 20px;
    height: calc(100% - 28px);
    width: calc(100% - 2px);
  }
}
.device-dnd-button {
  position: absolute;
  bottom: 5px;
  right: 5px;
}
</style>
