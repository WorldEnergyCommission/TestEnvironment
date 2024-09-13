<template>
  <div class="aiml-library w-100">
    <CoreTabs :key="$i18n.locale" v-model="tab" show-arrows class="tabs-with-space">
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
import MPCPreviewsList from "@/ui/components/devices/previews/components/MPCPreviewsList.vue";
import { envAimlLibraryCategories } from "@/utils/env";

/**
 * AIML page, here render Anomaly Detection, ML Model devices previews
 */
export default defineComponent({
  components: {
    AnomalyDetectionPreviewsList,
    MPCPreviewsList,
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
      ],
    };
  },
  computed: {
    previewsFiltered() {
      return this.previews.filter((e) => envAimlLibraryCategories.includes(e.name));
    },
    localisationPath() {
      return "uiComponents.aimlLibrary.mainTabs";
    },
  },
});
</script>
