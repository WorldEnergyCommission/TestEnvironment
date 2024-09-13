<template>
  <BrightnessSensor :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import BrightnessSensor from "@/ui/components/devices/devices/BrightnessSensor.vue";

export default defineComponent({
  components: {
    BrightnessSensor,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "BrightnessSensor",
        data: { mappings: { OutputField_actualValue: "brightnessSensor" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.BrightnessSensor.previewName");
    },
  },
});
</script>
