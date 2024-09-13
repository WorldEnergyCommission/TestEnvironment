<template>
  <EnergyView :device-data="deviceData" :is-preview="true" style="height: 45rem" />
</template>

<script lang="ts">
import { defineComponent } from "vue";

import EnergyView from "@/ui/components/devices/devices/EnergyViewDevice/EnergyView.vue";
import { systemComponentMappings } from "@/ui/components/devices/devices/EnergyViewDevice/EnergyViewSystems";
import forecastMockData from "@/ui/components/devices/previews/mpc/EMS/forecastMockData";

export default defineComponent({
  components: {
    EnergyView,
  },
  props: {
    isPreviewManageModalOpen: { default: false, type: Boolean },
  },
  data() {
    const noDataMap: any = {
      pvSystem: false,
      generator: false,
      grid: false,
      battery: false,
      heating: false,
    };
    const newAnimationsMap: any = {
      pvSystem: false,
      generator: false,
      grid: true,
      battery: false,
      heating: true,
    };
    const titlesForEnergyPoints: any = {
      titlePV: ["PV Norden"],
      titleGenerator: ["Generator 1", "Generator 2"],
      titleGrid: ["Grid"],
      titleBattery: ["Battery"],
      titleHouse: [],
      titleCharging: [],
      titleBoiler: ["Boiler 1", "Boiler 2", "Boiler 3"],
      titlePump: [],
      titleOther: [],
    };

    return {
      forecastData: forecastMockData,
      groupSlider: 0,
      titlesForEnergyPoints,
      newAnimationsMap,
      noDataMap,
    };
  },
  computed: {
    deviceData() {
      const intervals: Record<string, string> = {};
      const mappings: Record<string, string> = {};
      Object.keys(systemComponentMappings).forEach((key) => {
        intervals[key] = "1h";
        mappings[key] = key;
      });
      return {
        name: this.previewNameLang,
        type: "EnergyView",
        data: {
          mappings: mappings,
          meta: {
            titleMapping: Object.keys(systemComponentMappings).map((key) => {
              return { key: key, value: key };
            }),
            intervals: intervals,
          },
        },
      };
    },
    description() {
      return this.$t("devicesDescriptions.EnergyView");
    },
    previewNameLang() {
      return this.$t("devices.EnergyView.previewName");
    },
  },
});
</script>
