<template>
  <AirHumiditySensor :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import AirHumiditySensor from "@/ui/components/devices/devices/AirHumiditySensor.vue";

export default defineComponent({
  components: {
    AirHumiditySensor,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "AirHumiditySensor",
        data: { mappings: { OutputField_actualValue: "airHumiditySensor" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.AirHumiditySensor.previewName");
    },
  },
});
</script>
