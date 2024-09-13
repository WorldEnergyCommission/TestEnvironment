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
      <InputFieldBase
        :field-rules="[rules.required, rules.twoComas]"
        :input-field-styles="{ flexGrow: '1' }"
        :is-decimal="true"
        :variable-data="deviceData.data.mappings"
        class="pt-3"
        instance="InputField"
        :with-spacer="false"
        :is-preview="isPreview"
      >
        <template v-if="unit && unit != ''" #unit>
          <div :class="['unit', { 'px-2': unit.length }]">
            {{ unit }}
          </div>
        </template>
      </InputFieldBase>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import InputFieldBase from "@/ui/components/devices/devices/base/InputFieldBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { Validation } from "@/ui/mixins/validation";
import { envDomain } from "@/utils/env";

/**
 * Component that represent VariableInputField device
 */
export default defineComponent({
  components: {
    InputFieldBase,
    DeviceLayout,
  },
  mixins: [Validation, DeviceBase],
  data() {
    const domain: string = envDomain;

    return {
      domain,
    };
  },
  computed: {
    unit() {
      return this.deviceData!.data.meta?.unit ? this.deviceData!.data.meta.unit : "";
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
.variable-input-field {
  .device-body {
    position: relative;
    display: flex;
    justify-content: center;

    .variable-input-field-icon {
      position: absolute;
      left: 10px;
      height: 100%;
      display: flex;
      align-items: center;
    }

    .device-basic-controls {
      height: 110px;
      padding: 35px 0 0 0;
      width: 280px;
    }
  }

  .unit {
    font-size: 15px;
    padding-top: 5px;
    text-align: center;
  }
}
</style>
