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
      <div class="drop-down-input-field-with-variable">
        <DropDownBase
          :label="deviceData.data.meta.dropDownTexts.DropDown_title"
          :text-mapping="deviceData.data.meta.dropDownTexts.DropDown_textmapping"
          :variable-data="deviceData.data.mappings"
          instance="DropDown"
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
import { defineComponent } from "vue";

import DropDownBase from "@/ui/components/devices/devices/base/DropDown.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";
import { envDomain } from "@/utils/env";

/**
 * Component that represent DropDownInputFieldWithVariable device
 */
export default defineComponent({
  components: {
    DropDownBase,
    DeviceLayout,
  },
  mixins: [Validation, DeviceBase],
  data() {
    const domain: string = envDomain;

    return {
      domain,
    };
  },
  methods: {
    iconTheme() {
      return { filter: this.$vuetify.theme.current.dark ? "brightness(0) invert(1)" : null };
    },
  },
});
</script>

<style lang="scss" scoped>
.drop-down-input-field-with-variable {
  width: 100%;
}
</style>
