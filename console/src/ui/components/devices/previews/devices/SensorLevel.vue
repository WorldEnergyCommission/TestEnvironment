<template>
  <SensorLevel :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import SensorLevel from "@/ui/components/devices/devices/SensorLevel.vue";

export default defineComponent({
  components: {
    SensorLevel,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "SensorLevel",
        data: { mappings: { OutputField_actualValue: "sensorLevel" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.SensorLevel.previewName");
    },
  },
});
</script>
