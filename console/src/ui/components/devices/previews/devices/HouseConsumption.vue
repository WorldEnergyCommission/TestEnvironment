<template>
  <HouseConsumption :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import HouseConsumption from "@/ui/components/devices/devices/HouseConsumption.vue";

export default defineComponent({
  components: {
    HouseConsumption,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "HouseConsumption",
        data: { mappings: { OutputField_actualValue: "houseConsumption" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.HouseConsumption.previewName");
    },
  },
});
</script>
