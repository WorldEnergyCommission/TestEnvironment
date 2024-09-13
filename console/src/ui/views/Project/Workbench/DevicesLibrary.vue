<template>
  <div class="project-devices-library w-100">
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

import ChartsView from "@/ui/components/devices/previews/components/ChartsView.vue";
import DevicesView from "@/ui/components/devices/previews/components/DevicesView.vue";
import TSGView from "@/ui/components/devices/previews/components/TSGView.vue";
import { envDeviceLibraryCategories } from "@/utils/env";

/**
 * Device Library page
 * here are previews of the devices, charts
 */
export default defineComponent({
  components: {
    TSGView,
    ChartsView,
    DevicesView,
  },
  data() {
    return {
      tab: null,
    };
  },
  computed: {
    previews() {
      return [
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
      ];
    },
    previewsFiltered() {
      return this.previews.filter((e: any) =>
        Object.keys(envDeviceLibraryCategories).some((el: string) => el === e.name),
      );
    },
  },
});
</script>
