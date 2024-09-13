<template>
  <div class="system-instance-view">
    <FormModal :form-title="instanceData.title" window-width="1000">
      <template #activator>
        <InstancePreview
          :system-type-string="systemTypeString"
          :preview-actual-value="previewActualValue"
          :output-field-actual-power="outputFieldActualPower"
          :instance-data="instanceData"
          :animated-line-props="{
            size: instanceCanvasSize,
            center: instanceCanvasCenter,
            point: instanceLineData,
          }"
          :instance-line-ready="instanceLineReady"
          :preview-title-position="previewTitlePosition"
          style="cursor: pointer"
        />
      </template>
      <template #content>
        <CoreContainer class="system-instance-view-content">
          <CoreRow class="charge-station-system-instance-view-content-wrapper">
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_manual, instanceData.state_manual]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.manualON") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switch2VManualOn"
                    instance="Switch2V"
                    style="margin: 0 0 0 10px"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[
                  instanceData.switch_emergency,
                  instanceData.state_emergency,
                ]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.atEmergencyPowerOff") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switch2VOnEmergencyPowerOff"
                    instance="Switch2V"
                    style="margin: 0 0 0 10px"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_enable, instanceData.state_enable]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.enableChargingStation") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switch2VEnableChargingStation"
                    instance="Switch2V"
                    style="margin: 0 0 0 10px"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[
                  instanceData.slider_target_power,
                  instanceData.slider_manual,
                ]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.manualPower") }}
                </template>
                <template #value>
                  <div class="charge-station-slider">
                    <div class="slider-actual-value">
                      <OutputFieldBase
                        :variable-data="sliderManualActualValue"
                        instance="OutputField"
                        :is-preview="isPreview"
                      />
                      <div>%</div>
                    </div>
                    <div class="slider">
                      <SliderBase
                        :is-active="sliderManualIsActive"
                        :state="sliderManualActualValueState"
                        :variable-data="sliderManual"
                        instance="Slider"
                        :is-preview="isPreview"
                      />
                    </div>
                  </div>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.min_power, instanceData.slider_min_power]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.minimalPower") }}
                </template>
                <template #value>
                  <div class="charge-station-slider">
                    <div class="slider-actual-value">
                      <OutputFieldBase
                        :variable-data="sliderMinimalActualValue"
                        instance="OutputField"
                        :is-preview="isPreview"
                      />
                      <div>%</div>
                    </div>
                    <div class="slider">
                      <SliderBase
                        :is-active="sliderMinimalIsActive"
                        :state="sliderMinimalActualValueState"
                        :variable-data="sliderMinimal"
                        instance="Slider"
                        :is-preview="isPreview"
                      />
                    </div>
                  </div>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <div class="pt-2">
                <InputFieldBase
                  :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan255]"
                  :is-decimal="false"
                  :max="255"
                  :min="0"
                  :step="1"
                  :variable-data="inputFieldPriorityEMS"
                  instance="InputField"
                  :with-spacer="false"
                  :input-colums="2"
                  :is-preview="isPreview"
                >
                  <template #textDescription>
                    {{ $t("mlModel.EMS.systems.charge_station.settings.priorityEMS") }}
                  </template>
                  <template #unit>
                    <div />
                  </template>
                </InputFieldBase>
              </div>
            </CoreColumn>
            <CoreColumn cols="12">
              <div class="pt-2">
                <InputFieldBase
                  :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                  :is-decimal="false"
                  :max="100"
                  :min="0"
                  :step="1"
                  :variable-data="inputFieldEnableSoc"
                  instance="InputField"
                  :with-spacer="false"
                  :input-colums="2"
                  :is-preview="isPreview"
                >
                  <template #textDescription>
                    {{ $t("mlModel.EMS.systems.charge_station.settings.enableSOC") }}
                  </template>
                  <template #unit> % </template>
                </InputFieldBase>
              </div>
            </CoreColumn>
            <CoreColumn cols="12">
              <InputFieldBase
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                :is-decimal="false"
                :max="100"
                :min="0"
                :step="1"
                :variable-data="inputFieldDisableSOC"
                instance="InputField"
                :with-spacer="false"
                :input-colums="2"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.disableSOC") }}
                </template>
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12">
              <InputFieldBase
                :field-rules="[
                  rules.required,
                  rules.fieldMoreThanNull,
                  rules.fieldLessThan500,
                  rules.twoComas,
                ]"
                :is-decimal="true"
                :max="500"
                :min="0"
                :step="0.01"
                :variable-data="inputFieldMaxPower"
                instance="InputField"
                :with-spacer="false"
                :input-colums="2"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.maxPower") }}
                </template>
                <template #unit> kW </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.power]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.actualPowerChargingStation") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="1000"
                    :min="-1000"
                    :variable-data="outputFieldActualPower"
                    instance="OutputField"
                    :is-preview="isPreview"
                  />
                  <span class="pl-2">kW</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.charging_time]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.chargingTime") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :variable-data="outputFieldChargingTime"
                    instance="OutputField"
                    :is-preview="isPreview"
                  />
                  <span class="pl-2">min</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.target_power]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.targetPowerChargingStation") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="false"
                    :max="100"
                    :min="0"
                    :variable-data="outputFieldTargetPower"
                    instance="OutputField"
                    :is-preview="isPreview"
                  />
                  <span class="pl-2">%</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.car_connected]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.carConnected") }}
                </template>
                <template #value>
                  <ShowEventDotBase
                    :items="[[1, $vuetify.theme.current.colors.green]]"
                    :variable-data="showEventDotCarConnected"
                    height="15"
                    instance="ShowEventDot"
                    width="15"
                    :is-preview="isPreview"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.state_charging_station]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.charge_station.settings.stateChargingStation") }}
                </template>
                <template #value>
                  <ShowEventDotBase
                    :items="[[1, $vuetify.theme.current.colors.green]]"
                    :variable-data="showEventDotStateCharging"
                    height="15"
                    instance="ShowEventDot"
                    width="15"
                    :is-preview="isPreview"
                  />
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
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import Switch2VBase from "@/ui/components/devices/devices/base/Switch2VBase.vue";
import InstancePreview from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstancePreview.vue";
import InstanceViewMixin from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstanceViewMixin";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that represent charge station system instance view.
 */
export default defineComponent({
  components: {
    FormModal,
    OutputFieldBase,
    ShowEventDotBase,
    SliderBase,
    Switch2VBase,
    InputFieldBase,
    LabelUnitWrapper,
    InstancePreview,
  },
  extends: InstanceViewMixin,
  data() {
    return {
      showOutputValue: true,
    };
  },
  computed: {
    previewActualValue() {
      if (this.showOutputValue) {
        return this.measurements.get(this.instanceData.power);
      } else {
        return this.measurements.get(this.instanceData.target_power);
      }
    },
    isNoData() {
      const type = typeof this.previewActualValue === "number";
      const zero = this.previewActualValue !== 0;
      return type && zero;
    },
    showEventDotCarConnected() {
      return {
        ShowEventDot_errorWarningState: this.instanceData.car_connected,
      };
    },
    outputFieldChargingTime() {
      return {
        OutputField_actualValue: this.instanceData.charging_time,
      };
    },
    showEventDotStateCharging() {
      return {
        ShowEventDot_errorWarningState: this.instanceData.state_charging_station,
      };
    },
    inputFieldPriorityEMS() {
      return {
        InputField_targetValue: this.instanceData.priority,
      };
    },
    inputFieldEnableSoc() {
      return {
        InputField_targetValue: this.instanceData.enable_soc,
      };
    },
    inputFieldDisableSOC() {
      return {
        InputField_targetValue: this.instanceData.disable_soc,
      };
    },
    inputFieldMaxPower() {
      return {
        InputField_targetValue: this.instanceData.max_power,
      };
    },
    sliderManual() {
      return {
        Slider_targetValue: this.instanceData.slider_manual,
      };
    },
    sliderManualActualValue() {
      return {
        OutputField_actualValue: this.instanceData.slider_target_power,
      };
    },
    sliderManualActualValueState() {
      return this.measurements.get(this.instanceData.slider_target_power);
    },
    sliderManualIsActive() {
      return true;
    },
    sliderMinimal() {
      return {
        Slider_targetValue: this.instanceData.slider_min_power,
      };
    },
    sliderMinimalActualValue() {
      return {
        OutputField_actualValue: this.instanceData.min_power,
      };
    },
    sliderMinimalActualValueState() {
      return this.measurements.get(this.instanceData.min_power);
    },
    sliderMinimalIsActive() {
      return true;
    },
    switch2VManualOn() {
      return {
        Switch2V_onOff: this.instanceData.switch_manual,
        Switch2V_state: this.instanceData.state_manual,
      };
    },
    switch2VOnEmergencyPowerOff() {
      return {
        Switch2V_onOff: this.instanceData.switch_emergency,
        Switch2V_state: this.instanceData.state_emergency,
      };
    },
    switch2VEnableChargingStation() {
      return this.switch2VEnable;
    },
    animatedLineMovement() {
      return typeof this.previewActualValue === "number" ? this.previewActualValue > 0 : null;
    },
  },
  created() {
    this.showOutputValue = !!this.instanceData.power.length;
  },
});
</script>

<style lang="scss">
.charge-station-system-instance-view-content-wrapper {
  width: 100%;

  .value {
    display: flex;
    justify-content: center;
  }

  .charge-station-slider {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: inherit;

    .slider-actual-value {
      display: flex;
      justify-content: flex-end;
      width: 100%;
    }

    .slider {
      width: 100%;
    }
  }
}
</style>
