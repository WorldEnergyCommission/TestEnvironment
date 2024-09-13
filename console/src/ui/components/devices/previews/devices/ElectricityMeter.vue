<template>
  <ElectricityMeter :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ElectricityMeter from "@/ui/components/devices/devices/ElectricityMeter.vue";

export default defineComponent({
  components: {
    ElectricityMeter,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ElectricityMeter",
        data: {
          mappings: {
            OutputField1_actualValue: "electricityMeterOutput1",
            OutputField2_actualValue: "electricityMeterOutput2",
            OutputField3_actualValue: "electricityMeterOutput3",
            OutputField4_actualValue: "electricityMeterOutput4",
            OutputField5_actualValue: "electricityMeterOutput5",
            OutputField6_actualValue: "electricityMeterOutput6",
            OutputField7_actualValue: "electricityMeterOutput7",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.ElectricityMeter.previewName");
    },
  },
});
</script>
