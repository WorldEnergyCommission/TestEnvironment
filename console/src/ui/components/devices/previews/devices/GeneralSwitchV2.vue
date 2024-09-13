<template>
  <GeneralSwitchV2 :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import GeneralSwitchV2 from "@/ui/components/devices/devices/GeneralSwitchV2.vue";

export default defineComponent({
  components: {
    GeneralSwitchV2,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "GeneralSwitchV2",
        data: {
          mappings: { Switch2V_onOff: "generalSwitchV2", Switch2V_state: "generalSwitchV2" },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.GeneralSwitchV2.previewName");
    },
  },
});
</script>
