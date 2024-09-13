<template>
  <PVMonitoringService :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import PVMonitoringService from "@/ui/components/devices/mpc/PVMonitoringService/index.vue";

export default defineComponent({
  components: {
    PVMonitoringService,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        id: "PVMonitoringService",
        type: "PVMonitoringService",
        data: {
          type: "PVMonitoringService",
          mappings: {},
        },
      };
    },
    description() {
      return this.$t("mlModelsDescriptions.PVMonitoringService");
    },
    previewNameLang() {
      return this.$t("mlModel.PVMonitoringService.previewName");
    },
    mockChartData() {
      let currentChartOptions: any = [];
      currentChartOptions = [
        {
          agg: "first",
          name: "Efficiency",
          scaling: {
            max: "100",
            min: "0",
          },
          seriesType: "View",
          type: "line",
          unit: "%",
          var: "",
        },
      ];

      const currentData = {
        data: {
          chartOptions: currentChartOptions,
          selectedStackingOptions: "normal",
          selectedWidth: "full",
          type: "chart",
        },
        created_at: "2021-10-07T07:43:33.554983Z",
      };
      return currentData;
    },
  },
});
</script>
