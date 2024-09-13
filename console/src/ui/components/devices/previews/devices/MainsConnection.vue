<template>
  <MainsConnection :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MainsConnection from "@/ui/components/devices/devices/MainsConnection.vue";

export default defineComponent({
  components: {
    MainsConnection,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "MainsConnection",
        data: { mappings: { OutputField_actualValue: "mainsConnection" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.MainsConnection.previewName");
    },
  },
});
</script>
