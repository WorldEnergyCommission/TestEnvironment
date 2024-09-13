<template>
  <VentilatorSwitch :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import VentilatorSwitch from "@/ui/components/devices/devices/VentilatorSwitch.vue";

export default defineComponent({
  components: {
    VentilatorSwitch,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "VentilatorSwitch",
        data: {
          mappings: {
            Switch_on: "ventilatorSwitch",
            Switch_off: "ventilatorSwitch",
            Switch_state: "ventilatorSwitch",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.VentilatorSwitch.previewName");
    },
  },
});
</script>
