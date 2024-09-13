<template>
  <DropDownInputFieldWithVariable :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import DropDownInputFieldWithVariable from "@/ui/components/devices/devices/DropDownInputFieldWithVariable.vue";

export default defineComponent({
  components: {
    DropDownInputFieldWithVariable,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "DropDownInputFieldWithVariable",
        data: {
          mappings: { DropDown_targetValue: "dropDownInputFieldWithVariable" },
          meta: {
            cover: "4801551",
            dropDownTexts: {
              DropDown_title: "Drop down",
              DropDown_textmapping: {
                0: "Example Text 1",
                1: "Example Text 2",
                2: "Example Text 3",
                3: "Example Text 4",
                4: "Example Text 5",
              },
            },
          },
        },
      };
    },
    previewNameLang() {
      return this.$t("devices.DropDownInputFieldWithVariable.previewName");
    },
  },
});
</script>
