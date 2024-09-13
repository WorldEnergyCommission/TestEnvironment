<template>
  <ElectricChargingStation :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ElectricChargingStation from "@/ui/components/devices/devices/ElectricChargingStation.vue";

export default defineComponent({
  components: {
    ElectricChargingStation,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ElectricChargingStation",
        data: {
          type: "ElectricChargingStation",
          mappings: {
            OutputField_actualValue: "electricChargingStationOutput",
            OutputField1_actualValue: "electricChargingStationOutput1",
            InputField_targetValue: "electricChargingStationInput",
            Switch1_on: "electricChargingStationSwitch1",
            Switch1_off: "electricChargingStationSwitch1",
            Switch1_state: "electricChargingStationSwitch1",
            Switch2_on: "electricChargingStationSwitch2",
            Switch2_off: "electricChargingStationSwitch2",
            Switch2_state: "electricChargingStationSwitch2",
            Slider_targetValue: "electricChargingStationSlider",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.ElectricChargingStation.mainView";
    },
    settingsViewLang() {
      return "devices.ElectricChargingStation.settingsView";
    },
    previewNameLang() {
      return this.$t("devices.ElectricChargingStation.previewName");
    },
  },
});
</script>
