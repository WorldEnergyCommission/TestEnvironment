<template>
  <WeekTrendSummary :device-data="deviceData" :is-preview="true" />
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import WeekTrendSummary from "@/ui/components/devices/devices/WeekTrendSummary.vue";

const { t } = useI18n();
const deviceData = computed(() => {
  return {
    name: t("devices.WeekTrendSummary.previewConfiguredName"),
    type: "WeekTrendSummary",
    data: {
      type: "WeekTrendSummary",
      mappings: {},
    },
  };
});
</script>
