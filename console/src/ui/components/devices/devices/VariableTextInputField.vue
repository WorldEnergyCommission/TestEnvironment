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
      <div class="variable-text-input-field">
        <InputFieldTextBase
          :field-rules="[rules.required, rules.fieldLessThan30]"
          :max="30"
          :min="0"
          :variable-data="deviceData.data.mappings"
          instance="InputFieldText"
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

import InputFieldTextBase from "@/ui/components/devices/devices/base/InputFieldTextBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";
import { envDomain } from "@/utils/env";

/**
 * Component that represent VariableTextInputField device
 */
export default defineComponent({
  components: {
    InputFieldTextBase,
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
.variable-text-input-field {
  .device-body {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;

    .variable-text-input-field-icon {
      position: absolute;
      left: 10px;
      height: 100%;
      display: flex;
      align-items: center;
    }

    .device-basic-controls {
      padding-top: 20px;
      width: 260px;
    }
  }
}
</style>
