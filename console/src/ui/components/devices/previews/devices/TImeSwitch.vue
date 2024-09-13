<template>
  <TimeSwitch :device-data="deviceData" :is-preview="true" />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import TimeSwitch from "@/ui/components/devices/devices/TimeSwitch.vue";

// Constants
const { t } = useI18n();
const previewNameLang = t("devices.TimeSwitch.previewName");

// Computed Properties
const deviceData = computed(() => {
  return {
    name: previewNameLang,
    type: "TimeSwitch",
    data: {
      mappings: {
        TimeSwitch_on: "timeSwitch",
        TimeSwitch_off: "timeSwitch",
        TimeSwitch_state: "timeSwitch",
        TimeSwitchControls_onOff: "timeSwitchControls",
      },
    },
  };
});
</script>
