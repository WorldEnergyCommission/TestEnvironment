<template>
  <LightSwitch :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LightSwitch from "@/ui/components/devices/devices/LightSwitch.vue";

export default defineComponent({
  components: {
    LightSwitch,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "LightSwitch",
        data: {
          mappings: {
            Switch_on: "lightSwitch",
            Switch_off: "lightSwitch",
            Switch_state: "lightSwitch",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.LightSwitch.previewName");
    },
  },
});
</script>
