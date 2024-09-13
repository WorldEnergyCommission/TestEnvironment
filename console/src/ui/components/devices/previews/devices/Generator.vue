<template>
  <Generator :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Generator from "@/ui/components/devices/devices/Generator.vue";

export default defineComponent({
  components: {
    Generator,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "Generator",
        data: {
          type: "Generator",
          mappings: {
            OutputField_actualValue: "generatorOutput",
            Switch_on: "generatorSwitch",
            Switch_off: "generatorSwitch",
            Switch_state: "generatorSwitch",
            PushButton_onOff: "generatorPushbutton",
            PushButton_state: "generatorPushbutton",
          },
        },
      };
    },
    settingsViewLang() {
      return "devices.Generator.settingsView";
    },
    previewNameLang() {
      return this.$t("devices.Generator.previewName");
    },
  },
});
</script>
