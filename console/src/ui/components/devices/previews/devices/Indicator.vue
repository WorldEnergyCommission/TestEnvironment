<template>
  <Indicator :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Indicator from "@/ui/components/devices/devices/Indicator.vue";

export default defineComponent({
  components: {
    Indicator,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "Indicator",
        data: { mappings: { Indicator_onOff: "indicator" }, meta: { cover: "4801555" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.Indicator.previewName");
    },
  },
});
</script>
