<template>
  <TV :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TV from "@/ui/components/devices/devices/TV.vue";

export default defineComponent({
  components: {
    TV,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "TV",
        data: {
          mappings: {
            Plus_commandPlus: "tvPlus",
            Minus_commandMinus: "tvMinus",
            Forward_commandForward: "tvForward",
            Reverse_commandReverse: "tvReverse",
            Switch_on: "tvSwitch",
            Switch_off: "tvSwitch",
            Switch_state: "tvSwitch",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.TV.previewName");
    },
  },
});
</script>
