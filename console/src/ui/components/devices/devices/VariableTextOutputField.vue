<template>
  <DeviceLayout :device-data="deviceData" :is-preview="isPreview" :preview-data="deviceData">
    <template #custom-icon>
      <img
        v-if="deviceData.data.meta.cover"
        :src="`https://static.${domain}/icons/${deviceData.data.meta.cover}.svg`"
        :style="iconTheme()"
        alt="icon"
        height="30"
        width="30"
      />
    </template>
    <template #basic-controls>
      <OutputFieldTextBase
        :max="30"
        :min="0"
        :variable-data="deviceData.data.mappings"
        instance="OutputFieldText"
        :is-preview="isPreview"
      />
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import OutputFieldTextBase from "@/ui/components/devices/devices/base/OutputFieldTextBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { envDomain } from "@/utils/env";

/**
 * Component that represent VariableTextOutputField device
 */
export default defineComponent({
  components: {
    OutputFieldTextBase,
    DeviceLayout,
  },
  extends: DeviceBase,
  data() {
    const domain: string = envDomain;

    return {
      domain,
    };
  },
  computed: {
    unit() {
      return this.deviceData!.data.meta && this.deviceData!.data.meta.unit
        ? this.deviceData!.data.meta.unit
        : "";
    },
  },
  methods: {
    iconTheme() {
      return { filter: this.$vuetify.theme.current.dark ? "brightness(0) invert(1)" : null };
    },
  },
});
</script>

<style lang="scss" scoped>
.variable-text-output-field {
}
</style>
