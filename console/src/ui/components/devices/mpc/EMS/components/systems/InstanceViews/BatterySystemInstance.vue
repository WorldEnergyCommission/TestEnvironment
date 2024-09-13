<template>
  <div class="system-instance-view">
    <FormModal :form-title="instanceData.title" window-width="1000">
      <template #activator>
        <InstancePreview
          style="cursor: pointer"
          :animated-line-props="{
            point: instanceLineData,
            size: instanceCanvasSize,
            center: instanceCanvasCenter,
          }"
          :instance-data="instanceData"
          :battery-s-o-c-value="batterySOCValue"
          :system-type-string="systemTypeString"
          :instance-line-ready="instanceLineReady"
          :preview-actual-value="previewActualValue"
          :preview-title-position="previewTitlePosition"
          :output-field-actual-power="outputFieldActualPower"
        />
      </template>
      <template #content>
        <CoreContainer class="system-instance-view-content">
          <CoreRow class="battery-system-instance-view-content-wrapper">
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_enable, instanceData.state_enable]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.battery.settings.enableBattery") }}
                </template>
                <template #value>
                  <Switch2VBase
                    instance="Switch2V"
                    style="margin: 0 0 0 10px"
                    :variable-data="switch2VEnable"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                class="pt-2"
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_reset, instanceData.state_reset]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.battery.settings.reset") }}
                </template>
                <template #value>
                  <PushButtonBase
                    icon-size="25"
                    button-size="35"
                    icon="push_reset"
                    instance="PushButton"
                    :is-preview="isPreview"
                    :variable-data="pushButtonReset"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <InputFieldBase
                instance="InputField"
                :min="0"
                :step="1"
                :max="255"
                :input-colums="2"
                :is-decimal="false"
                :with-spacer="false"
                :is-preview="isPreview"
                :variable-data="inputFieldPriorityEMS"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan255]"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.battery.settings.priorityEMS") }}
                </template>
                <template #unit>
                  <div />
                </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12">
              <InputFieldBase
                instance="InputField1"
                :field-rules="[
                  rules.required,
                  rules.twoComas,
                  rules.fieldMoreThanNull,
                  rules.fieldLessThan1000,
                ]"
                :min="0"
                :max="1000"
                :step="0.01"
                :input-colums="2"
                :is-decimal="true"
                :with-spacer="false"
                :is-preview="isPreview"
                :variable-data="inputFieldMaxSizeBatteryCapacity"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.battery.settings.maxSizeOfBatteryCapacity") }}
                </template>
                <template #unit> kWh </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12">
              <InputFieldBase
                instance="InputField1"
                :field-rules="[
                  rules.required,
                  rules.twoComas,
                  rules.fieldLessThan100,
                  rules.fieldMoreThanNull,
                ]"
                :min="0"
                :step="1"
                :max="100"
                :input-colums="2"
                :is-decimal="false"
                :with-spacer="false"
                :is-preview="isPreview"
                :variable-data="inputFieldSocRangeMax"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.battery.settings.socRangeMax") }}
                </template>
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12">
              <InputFieldBase
                instance="InputField1"
                :field-rules="[
                  rules.required,
                  rules.twoComas,
                  rules.fieldLessThan100,
                  rules.fieldMoreThanNull,
                ]"
                :min="0"
                :step="1"
                :max="100"
                :input-colums="2"
                :is-decimal="false"
                :with-spacer="false"
                :is-preview="isPreview"
                :variable-data="inputFieldSocRangeMin"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.battery.settings.socRangeMin") }}
                </template>
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                class="pt-2"
                :is-default-view="false"
                :variables-list-for-check="[instanceData.soc]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.battery.settings.actualBatterySOC") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    instance="OutputField"
                    :min="0"
                    :max="100"
                    :is-decimal="false"
                    :is-preview="isPreview"
                    :variable-data="outputFieldActualBatterySOC"
                  />
                  <span class="pl-2">%</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                class="pt-2"
                :is-default-view="false"
                :variables-list-for-check="[instanceData.power]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.battery.settings.actualBatteryPower") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    instance="OutputField"
                    :max="1000"
                    :min="-1000"
                    :is-decimal="true"
                    :is-preview="isPreview"
                    :variable-data="outputFieldActualPower"
                  />
                  <span class="pl-2">kW</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                class="pt-2"
                :is-default-view="false"
                :variables-list-for-check="[instanceData.capacity]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.battery.settings.actualBatteryCapacity") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    instance="OutputField"
                    :is-decimal="true"
                    :is-preview="isPreview"
                    :variable-data="outputFieldActualBattery"
                  />
                  <span class="pl-2">kWh</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                class="pt-2"
                :is-default-view="false"
                :variables-list-for-check="[instanceData.target_power]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.battery.settings.targetBatteryPower") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    instance="OutputField"
                    :max="100"
                    :min="-100"
                    :is-decimal="true"
                    :is-preview="isPreview"
                    :variable-data="targetPowerCapacityBattery"
                  />
                  <span class="pl-2">%</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper :is-default-view="true" class="pt-2">
                <template #label>
                  {{ $t("mlModel.EMS.systems.battery.settings.socOperationRange") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    instance="OutputField"
                    :min="0"
                    :max="100"
                    :is-decimal="true"
                    :is-preview="isPreview"
                    :variable-data="outputFieldSocRangeMin"
                  />
                  <span class="pl-2 pr-2">-</span>
                  <OutputFieldBase
                    instance="OutputField"
                    :min="0"
                    :max="100"
                    :is-decimal="true"
                    :is-preview="isPreview"
                    :variable-data="outputFieldSocRangeMax"
                  />
                  <span class="pl-2">%</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
          </CoreRow>
        </CoreContainer>
      </template>
    </FormModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import InputFieldBase from "@/ui/components/devices/devices/base/InputFieldBase.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import Switch2VBase from "@/ui/components/devices/devices/base/Switch2VBase.vue";
import InstancePreview from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstancePreview.vue";
import InstanceViewMixin from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstanceViewMixin";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that represent system instance view.
 */
export default defineComponent({
  components: {
    FormModal,
    InputFieldBase,
    PushButtonBase,
    OutputFieldBase,
    Switch2VBase,
    LabelUnitWrapper,
    InstancePreview,
  },
  extends: InstanceViewMixin,
  computed: {
    previewActualValue() {
      return this.measurements.get(this.instanceData.power);
    },
    isNoData() {
      const type = typeof this.previewActualValue === "number";
      const zero = this.previewActualValue !== 0;
      return type && zero;
    },
    batterySOCValue() {
      return this.measurements.get(this.instanceData.soc);
    },
    outputFieldActualBatterySOC() {
      return {
        OutputField_actualValue: this.instanceData.soc,
      };
    },
    outputFieldActualBattery() {
      return {
        OutputField_actualValue: this.instanceData.capacity,
      };
    },
    targetPowerCapacityBattery() {
      return this.outputFieldTargetPower;
    },
    inputFieldPriorityEMS() {
      return {
        InputField_targetValue: this.instanceData.priority,
      };
    },
    inputFieldMaxSizeBatteryCapacity() {
      return {
        InputField1_targetValue: this.instanceData.size_capacity,
      };
    },
    inputFieldSocRangeMax() {
      return {
        InputField1_targetValue: this.instanceData.soc_range_max ?? 100,
      };
    },
    inputFieldSocRangeMin() {
      return {
        InputField1_targetValue: this.instanceData.soc_range_min ?? 0,
      };
    },
    inputFieldBatteryStandbyOptimizationState() {
      return {
        InputField1_targetValue: this.instanceData.battery_standby_optimization_state ?? 0,
      };
    },
    inputFieldBatteryStandbyOptimizationMode() {
      return {
        InputField1_targetValue: this.instanceData.battery_standby_optimization_mode ?? 0,
      };
    },
    inputFieldBatteryStandbyOptimizationTimeOn() {
      return {
        InputField1_targetValue: this.instanceData.battery_standby_optimization_time_on ?? 0,
      };
    },
    inputFieldBatteryStandbyOptimizationTimeOff() {
      return {
        InputField1_targetValue: this.instanceData.battery_standby_optimization_time_off ?? 0,
      };
    },
    inputFieldBatteryStandbyOptimizationPowerOn() {
      return {
        InputField1_targetValue: this.instanceData.battery_standby_optimization_power_on ?? 0,
      };
    },
    inputFieldBatteryStandbyOptimizationPowerOff() {
      return {
        InputField1_targetValue: this.instanceData.battery_standby_optimization_power_off ?? 0,
      };
    },
    outputFieldSocRangeMax() {
      return {
        OutputField_actualValue: this.instanceData.soc_range_max ?? 100,
      };
    },
    outputFieldSocRangeMin() {
      return {
        OutputField_actualValue: this.instanceData.soc_range_min ?? 0,
      };
    },
  },
});
</script>

<style lang="scss">
.battery-system-instance-view-content-wrapper {
  width: 100%;

  .value {
    display: flex;
    justify-content: center;
  }
}
</style>
