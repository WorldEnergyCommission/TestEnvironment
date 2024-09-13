<template>
  <VariableTextInputField :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import VariableTextInputField from "@/ui/components/devices/devices/VariableTextInputField.vue";

export default defineComponent({
  components: {
    VariableTextInputField,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "VariableTextInputField",
        data: {
          mappings: { InputFieldText_targetValue: "variableTextInputField" },
          meta: { cover: "4801556" },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.VariableTextInputField.previewName");
    },
  },
});
</script>
