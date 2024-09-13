<template>
  <Gauge :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Gauge from "@/ui/components/devices/devices/Gauge.vue";

export default defineComponent({
  components: {
    Gauge,
  },
  props: {
    chartWidth: Number,
    isModal: {
      type: Boolean,
    },
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "Gauge",
        data: {
          meta: {
            scaling: {
              min: "0",
              max: "100",
            },
            unit: "kW",
          },
          mappings: { CurrentValueGaugeChart_actualValue: "gaugeValue" },
        },
      };
    },
    description() {
      return this.$t("devicesDescriptions.Gauge");
    },
    previewNameLang() {
      return this.$t("devices.Gauge.previewName");
    },
  },
});
</script>
