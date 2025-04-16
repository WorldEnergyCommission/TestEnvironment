<template>
  <div class="adam-curve">
    <DeviceCardWrapper>
      <template #title>
        {{ deviceData?.name }}
      </template>
      <template #actions>
        <DeviceActions :device="deviceData" @chart-change="onChange" />
      </template>
      <template #content>
        <BaseChart
          :chart-data="data"
          :chart-height="423"
          :threshold-value="deviceData?.data?.threshold"
          :min-number-of-series-for-wide-chart="4"
          :show-total-of-series="true"
          :show-time-selection="false"
          :show-device-actions="false"
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
  data() {
    return {
      data: {},
    };
  },
  methods: {},
});
</script>

<style lang="scss">
@import "./src/ui/scss/variables";
</style>
