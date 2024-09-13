<template>
  <VariableOutputField :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import VariableOutputField from "@/ui/components/devices/devices/VariableOutputField.vue";

export default defineComponent({
  components: {
    VariableOutputField,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "VariableOutputField",
        data: {
          mappings: { OutputField_actualValue: "variableOutputField" },
          meta: { cover: "4801550", unit: "kW" },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.VariableOutputField.previewName");
    },
  },
});
</script>
