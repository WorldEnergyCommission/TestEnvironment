<template>
  <HeatingMeter :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import HeatingMeter from "@/ui/components/devices/devices/HeatingMeter.vue";

export default defineComponent({
  components: {
    HeatingMeter,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "HeatingMeter",
        data: {
          mappings: {
            OutputField1_actualValue: "heatingMeterOutput1",
            OutputField2_actualValue: "heatingMeterOutput2",
            OutputField3_actualValue: "heatingMeterOutput3",
            OutputField4_actualValue: "heatingMeterOutput4",
            OutputField5_actualValue: "heatingMeterOutput5",
            OutputField6_actualValue: "heatingMeterOutput6",
            OutputField7_actualValue: "heatingMeterOutput7",
            OutputField8_actualValue: "heatingMeterOutput8",
            OutputField9_actualValue: "heatingMeterOutput9",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.HeatingMeter.previewName");
    },
  },
});
</script>
