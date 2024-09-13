<template>
  <SetpointOptimizer :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import SetpointOptimizer from "@/ui/components/devices/mpc/SetpointOptimizer/SPO.vue";

export default defineComponent({
  components: {
    SetpointOptimizer,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "SetpointOptimizer",
        data: {
          type: "SetpointOptimizer",
        },
      };
    },
    previewNameLang() {
      return this.$t("mlModel.SetpointOptimizer.previewName");
    },
  },
});
</script>
