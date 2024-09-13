<template>
  <DropDownOutputFieldWithVariable :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import DropDownOutputFieldWithVariable from "@/ui/components/devices/devices/DropDownOutputFieldWithVariable.vue";

export default defineComponent({
  components: {
    DropDownOutputFieldWithVariable,
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "DropDownOutputFieldWithVariable",
        data: {
          mappings: { DropDown_targetValue: "dropDownOutputFieldWithVariable" },
          meta: {
            cover: "4801530",
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
      return this.$t("devices.DropDownOutputFieldWithVariable.previewName");
    },
  },
});
</script>
