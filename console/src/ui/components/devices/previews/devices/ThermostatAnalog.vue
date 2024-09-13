<template>
  <ThermostatAnalog :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ThermostatAnalog from "@/ui/components/devices/devices/ThermostatAnalog.vue";

export default defineComponent({
  components: {
    ThermostatAnalog,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ThermostatAnalog",
        data: {
          type: "ThermostatAnalog",
          mappings: {
            Switch1_on: "thermostatAnalogSwitch1",
            Switch1_off: "thermostatAnalogSwitch1",
            Switch1_state: "thermostatAnalogSwitch1",
            Switch2_on: "thermostatAnalogSwitch2",
            Switch2_off: "thermostatAnalogSwitch2",
            Switch2_state: "thermostatAnalogSwitch2",
            Switch3_on: "thermostatAnalogSwitch3",
            Switch3_off: "thermostatAnalogSwitch3",
            Switch3_state: "thermostatAnalogSwitch3",
            InputField1_targetValue: "thermostatAnalogInput1",
            InputField2_targetValue: "thermostatAnalogInput2",
            InputField3_targetValue: "thermostatAnalogInput3",
            InputField4_targetValue: "thermostatAnalogInput4",
            InputField5_targetValue: "thermostatAnalogInput5",
            InputField6_targetValue: "thermostatAnalogInput6",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.ThermostatAnalog.mainView";
    },
    settingsViewLang() {
      return "devices.ThermostatAnalog.settingsView";
    },
    previewNameLang() {
      return this.$t("devices.ThermostatAnalog.previewName");
    },
  },
});
</script>
