<template>
  <ColdWaterMeter :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ColdWaterMeter from "@/ui/components/devices/devices/ColdWaterMeter.vue";

export default defineComponent({
  components: {
    ColdWaterMeter,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ColdWaterMeter",
        data: {
          mappings: {
            OutputField1_actualValue: "coldWaterMeterOutput1",
            OutputField2_actualValue: "coldWaterMeterOutput2",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.ColdWaterMeter.previewName");
    },
  },
});
</script>
