<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="electric-charging-station"
    device-icon-size="26"
    device-size="x2h"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="tsg-ladestation-not-aus">
        <DropDownBase
          :label="$t('devices.TSGLadestationNotAus.mainView.dropDownTitle1')"
          :text-mapping="textMappingStatus"
          :variable-data="deviceData.data.mappings"
          instance="DropDown1"
          :is-preview="isPreview"
        />

        <DropDownBase
          :label="$t('devices.TSGLadestationNotAus.mainView.dropDownTitle2')"
          :text-mapping="textMappingEmergency"
          :variable-data="deviceData.data.mappings"
          class="pt-2"
          instance="DropDown2"
          :is-preview="isPreview"
        />

        <div class="d-flex justify-space-between pt-2">
          <div class="d-flex align-center">
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.DropDown1_targetValue]"
            >
              <template #label>
                {{ $t("devices.TSGLadestationNotAus.mainView.engine") }}
              </template>
              <template #value>
                <div class="ma-auto d-flex">
                  <ShowEventDotBase
                    :inactive-color="$vuetify.theme.current.colors.error"
                    :items="[[1, $vuetify.theme.current.colors.green]]"
                    :variable-data="deviceData.data.mappings"
                    height="15"
                    instance="DropDown1"
                    mapping-extension="targetValue"
                    width="15"
                    :is-preview="isPreview"
                  />
                </div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex align-center">
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.DropDown2_targetValue]"
            >
              <template #label>
                {{ $t("devices.TSGLadestationNotAus.mainView.emergencyOff") }}
              </template>
              <template #value>
                <div class="ma-auto d-flex">
                  <ShowEventDotBase
                    :inactive-color="$vuetify.theme.current.colors.error"
                    :items="[[1, $vuetify.theme.current.colors.green]]"
                    :variable-data="deviceData.data.mappings"
                    height="15"
                    instance="DropDown2"
                    mapping-extension="targetValue"
                    width="15"
                    :is-preview="isPreview"
                  />
                </div>
              </template>
            </LabelUnitWrapper>
          </div>
        </div>

        <LabelUnitWrapper
          :variables-list-for-check="[
            deviceData.data.mappings.PushButton_onOff,
            deviceData.data.mappings.PushButton_state,
          ]"
        >
          <template #label> Reset </template>
          <template #value>
            <div class="ma-auto d-flex">
              <PushButtonBase
                :variable-data="deviceData.data.mappings"
                button-size="35"
                icon="push_reset"
                icon-size="25"
                instance="PushButton"
                :is-preview="isPreview"
              />
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
import DropDownBase from "@/ui/components/devices/devices/base/DropDown.vue";
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import DeviceBase from "@/ui/components/devices/devices/DeviceBase";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";

export default defineComponent({
  components: {
    DropDownBase,
    PushButtonBase,
    ShowEventDotBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
  computed: {
    textMappingStatus() {
      return {
        0: this.$t(`${this.langPath}.mainView.dropDown1.value0`),
        1: this.$t(`${this.langPath}.mainView.dropDown1.value1`),
      };
    },
    textMappingEmergency() {
      return {
        0: this.$t(`${this.langPath}.mainView.dropDown2.value0`),
        1: this.$t(`${this.langPath}.mainView.dropDown2.value1`),
      };
    },
  },
});
</script>

<style lang="scss" scoped>
.tsg-ladestation-not-aus {
  width: 100%;
}
</style>
