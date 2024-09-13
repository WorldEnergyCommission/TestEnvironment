<template>
  <VariableTextOutputField :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import VariableTextOutputField from "@/ui/components/devices/devices/VariableTextOutputField.vue";

export default defineComponent({
  components: {
    VariableTextOutputField,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "VariableTextOutputField",
        data: {
          mappings: { OutputFieldText_actualValue: "variableTextOutputField" },
          meta: { cover: "4801552" },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.VariableTextOutputField.previewName");
    },
  },
});
</script>
