<template>
  <Battery :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Battery from "@/ui/components/devices/devices/Battery.vue";

export default defineComponent({
  components: {
    Battery,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "Battery",
        data: { mappings: { previewBattery_actualValue: "battery" } },
      };
    },
    description() {
      return this.$t("devicesDescriptions.Battery");
    },
    previewNameLang() {
      return this.$t("devices.Battery.previewName");
    },
  },
});
</script>
