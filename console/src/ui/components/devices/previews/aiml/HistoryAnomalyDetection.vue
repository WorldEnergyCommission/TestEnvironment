<template>
  <HistoryAnomalyDetection :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import HistoryAnomalyDetection from "@/ui/components/devices/anomalyDetection/HistoryAnomalyDetection.vue";

export default defineComponent({
  components: {
    HistoryAnomalyDetection,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "HistoryAnomalyDetection",
        data: {
          type: "HistoryAnomalyDetection",
          chartOptions: [
            {
              calculation: {
                expression: "",
              },
              name: "Temperature",
              type: "spline",
              scaling: {
                min: 0,
                max: 100,
              },
            },
            {
              calculation: {
                expression: "",
              },
              name: "AnomalyScore",
              type: "line",
              scaling: {
                min: 0,
                max: 100,
              },
            },
          ],
          meta: {
            controllerMappings: {
              anomalyScore: [],
            },
          },
        },
      };
    },
    previewNameLang() {
      return this.$tm("anomalyDetection.HistoryAnomalyDetection.previewName");
    },
    description() {
      return this.$tm("anomalyDetectionDescriptions.HistoryAnomalyDetection");
    },
  },
});
</script>
