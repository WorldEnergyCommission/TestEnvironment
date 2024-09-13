<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="generator"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="d-flex generator">
        <LabelUnitWrapper :disabled="!isActualValueVariableFilled">
          <template #value>
            <OutputFieldBase
              :is-decimal="true"
              :max="1000"
              :min="0"
              :variable-data="deviceData.data.mappings"
              instance="OutputField"
              :is-preview="isPreview"
            />
            <div class="pl-2">kW</div>
          </template>
        </LabelUnitWrapper>
      </div>
    </template>
    <template #settings-view>
      <div class="generator-settings">
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.Switch_on,
            deviceData.data.mappings.Switch_off,
            deviceData.data.mappings.Switch_state,
          ]"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.manual`) }}
          </template>
          <template #value>
            <SwitchBase
              :variable-data="deviceData.data.mappings"
              class="py-0 my-0"
              instance="Switch"
              :is-preview="isPreview"
            />
          </template>
        </LabelUnitWrapper>
        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.PushButton_onOff,
            deviceData.data.mappings.PushButton_state,
          ]"
          class="pt-4"
        >
          <template #label>
            {{ $t(`${langPath}.settingsView.reset`) }}
          </template>
          <template #value>
            <PushButtonBase
              :variable-data="deviceData.data.mappings"
              class="mr-4"
              icon="push_reset"
              instance="PushButton"
              :is-preview="isPreview"
            />
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
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import SwitchBase from "@/ui/components/devices/devices/base/SwitchBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

/**
 * Component that represent Generator device
 */
export default defineComponent({
  components: {
    SwitchBase,
    PushButtonBase,
    OutputFieldBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
  computed: {
    isActualValueVariableFilled() {
      return !!this.deviceData!.data.mappings.OutputField_actualValue.length;
    },
  },
});
</script>

<style lang="scss">
@import "./src/ui/scss/mixins";

.generator {
  @include mediumText;
}

.generator-settings {
  .generator-settings-field {
    &:last-of-type {
      margin-top: 20px;
    }

    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 20px;
    color: rgb(var(--v-theme-lynusText));

    .v-input--selection-controls__input {
      margin-right: 0 !important;
    }

    .push-button-base {
      margin-right: 8px;
    }
  }
}
</style>
