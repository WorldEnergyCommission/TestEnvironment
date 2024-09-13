<template>
  <DeviceCardWrapper>
    <template #title>
      {{ chartTitle }}
    </template>
    <template #actions>
      <DeviceActions :device="chartData" />
    </template>
    <template #content>
      <div class="h-100">
        <BaseChart
          :chart-data="chartData"
          :navigation-items-to-exclude="[]"
          class="chartStyles"
          :is-preview="true"
          :show-device-actions="false"
        />
      </div>
      <div class="d-flex justify-end pr-3">
        <DeviceDescription v-bind="{ description }" />
      </div>
    </template>
  </DeviceCardWrapper>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import DeviceActions from "@/ui/components/devices/actions/DeviceActions.vue";
import DeviceDescription from "@/ui/components/devices/actions/DeviceDescription.vue";
import BaseChart from "@/ui/components/devices/charts/charts/BaseChart.vue";
import { ChartData } from "@/ui/components/devices/charts/charts/types";
import DeviceCardWrapper from "@/ui/components/devices/layout/DeviceCardWrapper";

export default defineComponent({
  components: {
    DeviceDescription,
    BaseChart,
    DeviceCardWrapper,
    DeviceActions,
  },
  props: {
    chartWidth: Number,
    chartTitle: {
      default: "Line area chart",
      type: String,
    },
    chartDescription: {
      type: String,
    },
    chartData: {
      type: Object as PropType<ChartData>,
    },
  },
  computed: {
    description() {
      return this.$tm("chartsDescription.AreaChart");
    },
  },
});
</script>
