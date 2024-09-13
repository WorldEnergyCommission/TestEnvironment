<template>
  <WeatherStation :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import WeatherStation from "@/ui/components/devices/devices/WeatherStation.vue";

export default defineComponent({
  components: {
    WeatherStation,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "WeatherStation",
        data: {
          mappings: {
            OutputField1_actualValue: "weatherStationOutput1",
            OutputField2_actualValue: "weatherStationOutput2",
            OutputField3_actualValue: "weatherStationOutput3",
            OutputField4_actualValue: "weatherStationOutput4",
            OutputField5_actualValue: "weatherStationOutput5",
            OutputField6_actualValue: "weatherStationOutput6",
            OutputField7_actualValue: "weatherStationOutput7",
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.WeatherStation.previewName");
    },
  },
});
</script>
