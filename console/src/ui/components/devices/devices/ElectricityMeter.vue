<template>
  <DeviceLayout
    :device-data="deviceData"
    device-icon="electricity_meter"
    :is-preview="isPreview"
    :preview-data="deviceData"
  >
    <template #basic-controls>
      <div class="electricity-meter">
        <div>
          <div class="d-flex align-center">
            <div class="icon-wrapper">
              <lynus-icon color="theme" name="electricity" size="25" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField1_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField1"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kW</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex align-center">
            <div class="icon-wrapper">
              <lynus-icon color="theme" name="total-electrical-power_tarif_1" size="25" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField2_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField2"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kWh</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex align-center">
            <div class="icon-wrapper">
              <lynus-icon color="theme" name="total-electrical-power_tarif_2" size="25" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField3_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField3"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kWh</div>
              </template>
            </LabelUnitWrapper>
          </div>
        </div>
      </div>
    </template>
    <template #settings-view>
      <div class="electricity-meter-settings">
        <div>
          <div class="d-flex settings-view-field">
            <div class="icon-wrapper">
              <lynus-icon name="electrical-power-consumption_tarif_1" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField4_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField4"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kWh</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field">
            <div class="icon-wrapper">
              <lynus-icon name="electrical-power-production_tarif_1" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField5_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField5"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kWh</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field">
            <div class="icon-wrapper">
              <lynus-icon name="electrical-power-consumption_tarif_2" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField6_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField6"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kWh</div>
              </template>
            </LabelUnitWrapper>
          </div>
          <div class="d-flex settings-view-field">
            <div class="icon-wrapper">
              <lynus-icon name="electrical-power-production_tarif_2" />
            </div>
            <LabelUnitWrapper
              :variables-list-for-check="[deviceData.data.mappings.OutputField7_actualValue]"
            >
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :variable-data="deviceData.data.mappings"
                  instance="OutputField7"
                  :is-preview="isPreview"
                />
                <div class="pl-2">kWh</div>
              </template>
            </LabelUnitWrapper>
          </div>
        </div>
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

/**
 * Component that represent ElectricityMeter device
 */
export default defineComponent({
  components: {
    OutputFieldBase,
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: DeviceBase,
});
</script>

<style lang="scss" scoped>
.electricity-meter {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.electricity-meter-settings {
  display: flex;
  justify-content: center;
  font-size: 20px;

  .settings-view-field {
    margin-top: 10px;

    &:first-of-type {
      margin-top: 0;
    }

    .icon-wrapper {
      width: 50px;
    }
  }
}
</style>
