<template>
  <EMS :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import EMS from "@/ui/components/devices/mpc/EMS/EMS.vue";

export default defineComponent({
  components: {
    EMS,
  },
  props: {
    isPreviewManageModalOpen: { default: false, type: Boolean },
  },
  computed: {
    deviceData(): IDevice {
      return {
        name: this.previewNameLang,
        data: {
          type: "EMS",
          mappings: {},
        },
        collection_id: "",
        created_at: new Date(),
        favorite: false,
        id: "",
      };
    },
    previewNameLang() {
      return this.$t("mlModel.EMS.previewName");
    },
    description() {
      return this.$t("mlModelsDescriptions.EMS");
    },
  },
  methods: {
    switchSettingsView(setting: boolean) {
      this.isSettingsView = setting;
    },
  },
});
</script>
