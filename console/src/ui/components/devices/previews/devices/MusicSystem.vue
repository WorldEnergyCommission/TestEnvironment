<template>
  <MusicSystem :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import MusicSystem from "@/ui/components/devices/devices/MusicSystem.vue";

export default defineComponent({
  components: {
    MusicSystem,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "MusicSystem",
        data: {
          mappings: {
            Plus_commandPlus: "musicSystemPlus",
            Minus_commandMinus: "musicSystemMinus",
            Play_commandPlay: "musicSystemPlay",
            Stop_commandStop: "musicSystemStop",
            Pause_commandPause: "musicSystemPause",
            Forward_commandForward: "musicSystemForward",
            Reverse_commandReverse: "musicSystemReverse",
            Switch_on: "musicSystemSwitch",
            Switch_off: "musicSystemSwitch",
            Switch_state: "musicSystemSwitch",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.MusicSystem.previewName");
    },
  },
});
</script>
