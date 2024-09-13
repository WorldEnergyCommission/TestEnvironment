<template>
  <LightPushButton :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LightPushButton from "@/ui/components/devices/devices/LightPushButton.vue";

export default defineComponent({
  components: {
    LightPushButton,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "LightPushButton",
        data: {
          mappings: { PushButton_onOff: "lightPushButton", PushButton_state: "lightPushButton" },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.LightPushButton.previewName");
    },
  },
});
</script>
