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
      <div class="impulse-button">
        <PushButtonBase
          :variable-data="deviceData.data.mappings"
          :instance="instance"
          :timeout="1000"
          :is-preview="isPreview"
        />
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import BaseDevice from "@/ui/components/devices/devices/base/CommonDeviceBase";
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { envDomain } from "@/utils/env";

/**
 * Component that sends signal 1 for a duration of 1 second
 */
export default defineComponent({
  components: {
    DeviceLayout,
    PushButtonBase,
  },
  extends: BaseDevice,
  props: {
    deviceData: {
      type: Object as PropType<IDevice>,
    },
  },
  data() {
    const domain: string = envDomain;

    return {
      value: 0,
      instance: "ImpulseButton",
      domain,
    };
  },
  watch: {
    value: [
      {
        handler: "sendImpulse",
      },
    ],
  },
  methods: {
    impulse() {
      if (this.value === 1) return;

      this.value = 1;
      setTimeout(() => {
        this.value = 0;
      }, 1000);
    },
    iconTheme() {
      return { filter: this.$vuetify.theme.current.dark ? "brightness(0) invert(1)" : "none" };
    },
    sendImpulse() {
      this.send([{ v: this.value, n: this.measurementsClean.onOff, u: "" }]);
    },
  },
});
</script>

<style lang="scss" scoped>
.impulse-button {
  width: 100%;
  display: flex;
  justify-content: flex-end;
}
</style>
