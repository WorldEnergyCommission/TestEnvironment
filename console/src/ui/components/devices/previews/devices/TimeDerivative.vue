<template>
  <TimeDerivative :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TimeDerivative from "@/ui/components/devices/devices/TimeDerivative.vue";

export default defineComponent({
  components: {
    TimeDerivative,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "TimeDerivative",
        data: {
          mappings: { TimeDerivative_sourceVariable: "timeDerivative" },
          meta: { cover: "4801530", unit: "kW", interval: "1h" },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.TimeDerivative.previewName");
    },
  },
});
</script>
