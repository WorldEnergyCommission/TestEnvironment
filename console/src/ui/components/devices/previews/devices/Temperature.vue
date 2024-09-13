<template>
  <Temperature :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Temperature from "@/ui/components/devices/devices/Temperature.vue";

export default defineComponent({
  components: {
    Temperature,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "Temperature",
        data: { mappings: { OutputField_actualValue: "temperature" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.Temperature.previewName");
    },
  },
});
</script>
