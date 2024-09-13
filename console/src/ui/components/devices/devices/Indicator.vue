<template>
  <DeviceLayout :device-data="deviceData" :is-preview="isPreview" :preview-data="deviceData">
    <template #basic-controls>
      <div :style="bgStyle()" class="wrapper d-flex flex-column justify-center align-center">
        <img
          v-if="deviceData.data.meta.cover"
          :src="`https://static.${domain}/icons/${deviceData.data.meta.cover}.svg`"
          :style="iconStyle()"
          alt="icon"
          class="icon"
        />
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import { IMeasurementGetter } from "@/store/modules/measurements/types";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { envDomain } from "@/utils/env";
import { MappingsParser } from "@/utils/MappingsParser";

export default defineComponent({
  components: {
    DeviceLayout,
  },
  extends: MappingsParser,
  data() {
    const domain: string = envDomain;

    return {
      instanceName: "Indicator",
      domain,
    };
  },
  computed: {
    status() {
      return this.measurement(this.parsedMappings.onOff) === 1;
    },
    measurement(): IMeasurementGetter {
      return this.$store.getters["measurements/measurement"];
    },
  },
  methods: {
    iconStyle() {
      return {
        filter: this.$vuetify.theme.current.dark ? "brightness(0) invert(1)" : "none",
      };
    },
    bgStyle() {
      if (this.status) return {};
      return {
        "background-color": this.$vuetify.theme.current.dark ? "#aaa" : "#ddd",
      };
    },
  },
});
</script>

<style scoped>
.wrapper {
  border-radius: 50%;
  padding: 5px;
  width: 70px;
  height: 70px;
  background-color: rgb(var(--v-theme-accent));
}

.icon {
  width: 50px;
  height: 50px;
}
</style>
