<template>
  <SensorCO2 :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import SensorCO2 from "@/ui/components/devices/devices/SensorCO2.vue";

export default defineComponent({
  components: {
    SensorCO2,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "SensorCO2",
        data: { mappings: { OutputField_actualValue: "sensorCO2" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.SensorCO2.previewName");
    },
  },
});
</script>
