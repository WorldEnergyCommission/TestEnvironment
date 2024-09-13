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
      <div class="d-flex variable-output-field">
        <LabelUnitWrapper :disabled="!isActualValueVariableFilled">
          <template #value>
            <OutputFieldBase
              :is-decimal="true"
              :variable-data="deviceData.data.mappings"
              instance="OutputField"
              :is-preview="isPreview"
            />
            <div class="pl-2">
              {{ unit }}
            </div>
          </template>
        </LabelUnitWrapper>
      </div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { envDomain } from "@/utils/env";

/**
 * Component that represent VariableOutputField device
 */
export default defineComponent({
  components: {
    OutputFieldBase,
    DeviceLayout,
    LabelUnitWrapper,
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
    isActualValueVariableFilled() {
      return !!this.deviceData!.data.mappings.OutputField_actualValue.length;
    },
  },
  methods: {
    iconTheme() {
      return { filter: this.$vuetify.theme.current.dark ? "brightness(0) invert(1)" : undefined };
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/mixins";

.variable-output-field {
  @include mediumText;
}
</style>
