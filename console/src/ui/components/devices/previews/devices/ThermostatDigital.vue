<template>
  <ThermostatDigital :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import ThermostatDigital from "@/ui/components/devices/devices/ThermostatDigital.vue";

export default defineComponent({
  components: {
    ThermostatDigital,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "ThermostatDigital",
        data: {
          type: "ThermostatDigital",
          mappings: {
            Plus_commandPlus: "thermostatDigitalPlus",
            Minus_commandMinus: "thermostatDigitalMinus",
            Switch1_on: "thermostatDigitalSwitch1",
            Switch1_off: "thermostatDigitalSwitch1",
            Switch1_state: "thermostatDigitalSwitch1",
            Switch2_on: "thermostatDigitalSwitch2",
            Switch2_off: "thermostatDigitalSwitch2",
            Switch2_state: "thermostatDigitalSwitch2",
            Switch3_on: "thermostatDigitalSwitch3",
            Switch3_off: "thermostatDigitalSwitch3",
            Switch3_state: "thermostatDigitalSwitch3",
            OutputField_actualValue: "thermostatDigitalOutput",
            InputField1_targetValue: "thermostatDigitalInput1",
            InputField2_targetValue: "thermostatDigitalInput2",
            InputField3_targetValue: "thermostatDigitalInput3",
            InputField4_targetValue: "thermostatDigitalInput4",
          },
        },
      };
    },
    mainViewLang() {
      return "devices.ThermostatDigital.mainView";
    },
    settingsViewLang() {
      return "devices.ThermostatDigital.settingsView";
    },
    previewNameLang() {
      return this.$t("devices.ThermostatDigital.previewName");
    },
  },
});
</script>
