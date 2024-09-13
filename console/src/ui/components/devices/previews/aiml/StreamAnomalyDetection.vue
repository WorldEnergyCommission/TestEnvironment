<template>
  <StreamAnomalyDetection :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import StreamAnomalyDetection from "@/ui/components/devices/anomalyDetection/StreamAnomalyDetection.vue";

export default defineComponent({
  components: {
    StreamAnomalyDetection,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "StreamAnomalyDetection",
        data: {
          type: "StreamAnomalyDetection",
          chartOptions: [
            {
              calculation: {
                expression: "",
              },
              scaling: {
                max: 100,
                min: 0,
              },
              name: "Temperature",
              type: "spline",
            },
            {
              name: "AnomalyScore",
              type: "line",
              calculation: {
                expression: "",
              },
              scaling: {
                max: 100,
                min: 0,
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
      return this.$tm("anomalyDetection.StreamAnomalyDetection.previewName");
    },
    description() {
      return this.$tm("anomalyDetectionDescriptions.StreamAnomalyDetection");
    },
  },
});
</script>
