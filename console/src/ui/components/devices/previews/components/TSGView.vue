<template>
  <CoreCard>
    <CoreTabs :key="$i18n.locale" v-model="tab" class="tabs-with-space">
      <CoreTab v-for="(item, index) in devicesLibFiltered" :key="index">
        {{ $t(item.locale) }}
      </CoreTab>
    </CoreTabs>
    <CoreWindow v-model="tab">
      <CoreWindowItem v-for="(view, index) in devicesLibFiltered" :key="`t-${index}`">
        <CoreContainer fluid>
          <CoreRow>
            <CoreColumn
              v-for="(item, index) in view.data"
              :key="`c-${index}`"
              v-bind="{ ...item.sizes }"
            >
              <component :is="item.device" :is-modal="false" />
            </CoreColumn>
          </CoreRow>
        </CoreContainer>
      </CoreWindowItem>
    </CoreWindow>
  </CoreCard>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import TSGBrauchwasser from "@/ui/components/devices/previews/devices/TSGBrauchwasserPreview.vue";
import TSGFrischwasser from "@/ui/components/devices/previews/devices/TSGFrischwasserPreview.vue";
import TSGLadestationNotAus from "@/ui/components/devices/previews/devices/TSGLadestationNotAusPreview.vue";
import TSGModulLadestation from "@/ui/components/devices/previews/devices/TSGModulLadestationPreview.vue";
import { envDeviceLibraryCategories } from "@/utils/env";

export default defineComponent({
  components: {
    TSGFrischwasser,
    TSGBrauchwasser,
    TSGLadestationNotAus,
    TSGModulLadestation,
  },
  data() {
    return {
      tab: null,
    };
  },
  computed: {
    devicesLib() {
      return [
        {
          name: "TSG Devices",
          locale: "uiComponents.devicesLibrary.tsgTabs.tsgDevices",
          data: [
            { device: "TSGFrischwasser", sizes: { lg: 6, md: 12, sm: 12 } },
            { device: "TSGBrauchwasser", sizes: { lg: 6, md: 12, sm: 12 } },
            { device: "TSGLadestationNotAus", sizes: { lg: 3, md: 6, sm: 12 } },
            { device: "TSGModulLadestation", sizes: { lg: 3, md: 6, sm: 12 } },
          ],
        },
      ];
    },
    devicesLibFiltered() {
      return this.devicesLib.filter((e: any) => envDeviceLibraryCategories.TSG?.includes(e.name));
    },
  },
});
</script>
