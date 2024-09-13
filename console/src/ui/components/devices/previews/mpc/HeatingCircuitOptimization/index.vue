<template>
  <HeatingCircuitOptimization :device-data="deviceData" :is-preview="true" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import HeatingCircuitOptimization from "@/ui/components/devices/mpc/HeatingCircuitOptimization/index.vue";

export default defineComponent({
  components: {
    HeatingCircuitOptimization,
  },
  data() {
    const tab: any = null;

    return {
      tab,
      energySavingMode: 1,
    };
  },
  computed: {
    deviceData() {
      return {
        name: this.previewNameLang,
        type: "HeatingCircuitOptimization",
        data: {
          type: "HeatingCircuitOptimization",
          mappings: {},
          meta: {
            timing: {
              high_set_temperature: 10,
            },
          },
        },
      };
    },
    energySavingModesList() {
      return [
        {
          title: this.$t(
            "mlModel.HeatingCircuitOptimization.settingsView.energySavingModesList.comfort",
          ),
          value: 0,
        },
        {
          title: this.$t(
            "mlModel.HeatingCircuitOptimization.settingsView.energySavingModesList.balanced",
          ),
          value: 1,
        },
        {
          title: this.$t(
            "mlModel.HeatingCircuitOptimization.settingsView.energySavingModesList.energySaving",
          ),
          value: 2,
        },
      ];
    },
    mainViewLang() {
      return "mlModel.HeatingCircuitOptimization.mainView";
    },
    settingsViewLang() {
      return "mlModel.HeatingCircuitOptimization.settingsView";
    },
    previewNameLang() {
      return this.$t("mlModel.HeatingCircuitOptimization.previewName");
    },
  },
});
</script>
