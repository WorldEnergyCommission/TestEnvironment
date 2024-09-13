<template>
  <PVSystem :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import PVSystem from "@/ui/components/devices/devices/PVSystem.vue";

export default defineComponent({
  components: {
    PVSystem,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "PVSystem",
        data: { mappings: { OutputField_actualValue: "pvSystem" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.PVSystem.previewName");
    },
  },
});
</script>
