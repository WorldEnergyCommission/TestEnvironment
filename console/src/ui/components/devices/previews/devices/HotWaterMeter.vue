<template>
  <HotWaterMeter :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import HotWaterMeter from "@/ui/components/devices/devices/HotWaterMeter.vue";

export default defineComponent({
  components: {
    HotWaterMeter,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "HotWaterMeter",
        data: {
          mappings: {
            OutputField1_actualValue: "hotWaterMeterOutput1",
            OutputField2_actualValue: "hotWaterMeterOutput2",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.HotWaterMeter.previewName");
    },
  },
});
</script>
