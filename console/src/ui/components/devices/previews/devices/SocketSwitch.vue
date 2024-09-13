<template>
  <SocketSwitch :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import SocketSwitch from "@/ui/components/devices/devices/SocketSwitch.vue";

export default defineComponent({
  components: {
    SocketSwitch,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "SocketSwitch",
        data: {
          mappings: {
            Switch_on: "socketSwitch",
            Switch_off: "socketSwitch",
            Switch_state: "socketSwitch",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.SocketSwitch.previewName");
    },
  },
});
</script>
