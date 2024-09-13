<template>
  <VariableInputField :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import VariableInputField from "@/ui/components/devices/devices/VariableInputField.vue";

export default defineComponent({
  components: {
    VariableInputField,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "VariableInputField",
        data: {
          mappings: { InputField_targetValue: "variableInputField" },
          meta: { cover: "4801555", unit: "kW" },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.VariableInputField.previewName");
    },
  },
});
</script>
