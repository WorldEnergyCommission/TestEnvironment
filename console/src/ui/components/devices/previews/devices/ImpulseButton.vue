<template>
  <ImpulseButton :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ImpulseButton from "@/ui/components/devices/devices/ImpulseButton.vue";

export default defineComponent({
  components: {
    ImpulseButton,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ImpulseButton",
        data: { mappings: { ImpulseButton_onOff: "impulseButton" }, meta: { cover: "4801545" } },
      };
    },
    previewNameLang() {
      return this.$t("devices.ImpulseButton.previewName");
    },
  },
});
</script>
