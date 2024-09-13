<template>
  <div>
    <CoreTabs :key="$i18n.locale" v-model="tab" show-arrows>
      <CoreTab v-for="(item, index) in previewsFiltered" :key="index">
        {{ $t(item.locale) }}
      </CoreTab>
    </CoreTabs>
    <CoreWindow v-model="tab" :touch="false">
      <CoreWindowItem v-for="(item, index) in previewsFiltered" :key="`t-${index}`">
        <component :is="item.view" />
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import AnomalyDetectionPreviewsList from "@/ui/components/devices/previews/components/AnomalyDetectionPreviewsList.vue";
import ChartsView from "@/ui/components/devices/previews/components/ChartsView.vue";
import DevicesView from "@/ui/components/devices/previews/components/DevicesView.vue";
import MPCPreviewsList from "@/ui/components/devices/previews/components/MPCPreviewsList.vue";
import TSGView from "@/ui/components/devices/previews/components/TSGView.vue";
import { envAimlLibraryCategories, envDeviceLibraryCategories } from "@/utils/env";
/**
 * AIML page, here render Anomaly Detection, ML Model devices previews
 */
export default defineComponent({
  components: {
    AnomalyDetectionPreviewsList,
    MPCPreviewsList,
    TSGView,
    ChartsView,
    DevicesView,
  },
  data() {
    return {
      tab: null,
      previews: [
        {
          name: "Anomaly Detection",
          locale: "uiComponents.aimlLibrary.mainTabs.anomaly",
          title: "Anomaly Detection",
          view: "AnomalyDetectionPreviewsList",
        },
        {
          name: "MPC",
          locale: "uiComponents.aimlLibrary.mainTabs.mpc",
          title: "ML Model",
          view: "MPCPreviewsList",
        },
        {
          name: "Building Automation",
          locale: "uiComponents.devicesLibrary.mainTabs.buildingAutomation",
          view: "DevicesView",
        },
        {
          name: "Charts",
          locale: "uiComponents.devicesLibrary.mainTabs.charts",
          view: "ChartsView",
        },
        {
          name: "TSG",
          locale: "uiComponents.devicesLibrary.mainTabs.tsg",
          view: "TSGView",
        },
      ],
    };
  },
  computed: {
    previewsFiltered() {
      return this.previews.filter(
        (e) =>
          envAimlLibraryCategories.includes(e.name) ||
          Object.keys(envDeviceLibraryCategories).some((el: string) => el === e.name),
      );
    },
    localisationPath() {
      return "uiComponents.aimlLibrary.mainTabs";
    },
  },
});
</script>
<style lang="scss" scoped></style>
