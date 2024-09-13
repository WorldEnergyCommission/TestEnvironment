<template>
  <div class="system-instance-view">
    <FormModal :form-title="instanceData.title" window-width="1500">
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
          <CoreRow class="electric-heating-system-instance-view-content-wrapper">
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldHours]"
                :icon-styles="{ width: '40px', textAlign: 'center' }"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="23"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldHourOn"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("uiComponents.form.on") }}
                </template>
                <template #unit>
                  {{ $t("uiComponents.form.h") }}
                </template>
                <template #icon>
                  <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
                </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldMinutes]"
                :icon-styles="{ width: '40px', textAlign: 'center' }"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="59"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldMinOn"
                instance="InputField"
              >
                <template #textDescription>
                  {{ $t("uiComponents.form.on") }}
                </template>
                <template #unit>
                  {{ $t("uiComponents.form.min") }}
                </template>
                <template #icon>
                  <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
                </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldHours]"
                :icon-styles="{ width: '40px', textAlign: 'center' }"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="23"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldHourOff"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("uiComponents.form.off") }}
                </template>
                <template #unit>
                  {{ $t("uiComponents.form.h") }}
                </template>
                <template #icon>
                  <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
                </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldMinutes]"
                :icon-styles="{ width: '40px', textAlign: 'center' }"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="59"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldMinOff"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("uiComponents.form.off") }}
                </template>
                <template #unit>
                  {{ $t("uiComponents.form.min") }}
                </template>
                <template #icon>
                  <CoreIcon class="pt-2" size="18"> far fa-clock </CoreIcon>
                </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan120]"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="120"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldTargetTempOn"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.temperatureOn") }}
                </template>
                <template #unit> °C </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan120]"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="120"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldTargetTempOff"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.temperatureOff") }}
                </template>
                <template #unit> °C </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan120]"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="120"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldTargetTempMax"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.temperatureMax") }}
                </template>
                <template #unit> °C </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.power]"
                class="pt-2"
              >
                <template #label>
                  {{
                    $t("mlModel.EMS.systems.electric_heating.settings.actualPowerHeatingElement")
                  }}
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
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.temperature]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.temperatureBoiler") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="120"
                    :min="-30"
                    :variable-data="outputFieldTemperatureBoiler"
                    instance="OutputField"
                    :is-preview="isPreview"
                  />
                  <span class="pl-2">°C</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.target_power]"
                class="pt-2"
              >
                <template #label>
                  {{
                    $t("mlModel.EMS.systems.electric_heating.settings.targetPowerHeatingElement")
                  }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="100"
                    :min="0"
                    :variable-data="outputFieldTargetPowerHeating"
                    instance="OutputField"
                    :is-preview="isPreview"
                  />
                  <span class="pl-2">%</span>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.state_electric_heating]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.stateHeatingElement") }}
                </template>
                <template #value>
                  <ShowEventDotBase
                    :items="[[1, $vuetify.theme.current.colors.green]]"
                    :variable-data="showEventDotStateHeating"
                    height="15"
                    instance="ShowEventDot"
                    width="15"
                    :is-preview="isPreview"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6" />
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_manual, instanceData.state_manual]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.manualON") }}
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
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[
                  instanceData.switch_emergency,
                  instanceData.state_emergency,
                ]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.atEmergencyPowerOff") }}
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
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_time, instanceData.state_time]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.activateTimeControl") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switch2VActivateTimeControl"
                    instance="Switch2V"
                    style="margin: 0 0 0 10px"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[
                  instanceData.switch_disable_protection,
                  instanceData.state_disable_protection,
                ]"
                class="pt-2"
              >
                <template #label>
                  {{
                    $t("mlModel.EMS.systems.electric_heating.settings.disableLegionellaProtection")
                  }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switch2VDisableLegionellaProtection"
                    instance="Switch2V"
                    style="margin: 0 0 0 10px"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_enable, instanceData.state_enable]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.enableHeatingElement") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switch2VEnableHeatingElement"
                    instance="Switch2V"
                    style="margin: 0 0 0 10px"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[
                  instanceData.slider_target_power,
                  instanceData.slider_manual,
                ]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.manualPower") }}
                </template>
                <template #value>
                  <div class="electric-heating-slider">
                    <div class="slider-actual-value">
                      <OutputFieldBase :variable-data="sliderActualValue" instance="OutputField" />
                      <div>%</div>
                    </div>
                    <div class="slider">
                      <SliderBase
                        :is-active="sliderIsActive"
                        :state="sliderActualValueState"
                        :variable-data="sliderMappings"
                        instance="Slider"
                        :is-preview="isPreview"
                      />
                    </div>
                  </div>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan255]"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="255"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldPriorityEMS"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.priorityEMS") }}
                </template>
                <template #unit>
                  <div />
                </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="100"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldEnableSoc"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.enableSOC") }}
                </template>
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :description-styles="{ width: '300px', paddingTop: '5px' }"
                :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                :input-field-styles="{ width: '250px' }"
                :is-decimal="false"
                :max="100"
                :min="0"
                :step="1"
                :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                :variable-data="inputFieldDisableSOC"
                instance="InputField"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.electric_heating.settings.disableSOC") }}
                </template>
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <template>
              <CoreColumn
                v-for="(mpItem, mpIndex) in maxPowerList"
                :key="mpIndex"
                class="pt-2"
                cols="12"
                md="6"
              >
                <InputFieldBase
                  :description-styles="{ width: '300px', paddingTop: '5px' }"
                  :field-rules="[
                    rules.required,
                    rules.fieldMoreThanNull,
                    rules.fieldLessThan500,
                    rules.twoComas,
                  ]"
                  :input-field-styles="{ width: '250px' }"
                  :is-decimal="true"
                  :max="500"
                  :min="0"
                  :step="0.01"
                  :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                  :variable-data="{ InputField_targetValue: instanceData.max_power[mpItem] }"
                  instance="InputField"
                  :is-preview="isPreview"
                >
                  <template #textDescription>
                    {{ $t("mlModel.EMS.systems.electric_heating.settings.maxPower") }} ({{
                      mpIndex + 1
                    }})
                  </template>
                  <template #unit> kW </template>
                </InputFieldBase>
              </CoreColumn>
            </template>
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
 * Component that represent electric heating system instance view.
 */
export default defineComponent({
  components: {
    FormModal,
    InputFieldBase,
    OutputFieldBase,
    ShowEventDotBase,
    SliderBase,
    Switch2VBase,
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
      if (this.showOutputValue === true) {
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
    outputFieldTemperatureBoiler() {
      return {
        OutputField_actualValue: this.instanceData.temperature,
      };
    },
    showEventDotStateHeating() {
      return {
        ShowEventDot_errorWarningState: this.instanceData.state_electric_heating,
      };
    },
    outputFieldTargetPowerHeating() {
      return this.outputFieldTargetPower;
    },
    inputFieldHourOn() {
      return {
        InputField_targetValue: this.instanceData.hour_on,
      };
    },
    inputFieldMinOn() {
      return {
        InputField_targetValue: this.instanceData.minute_on,
      };
    },
    inputFieldHourOff() {
      return {
        InputField_targetValue: this.instanceData.hour_off,
      };
    },
    inputFieldMinOff() {
      return {
        InputField_targetValue: this.instanceData.minute_off,
      };
    },
    inputFieldTargetTempOn() {
      return {
        InputField_targetValue: this.instanceData.target_temp_on,
      };
    },
    inputFieldTargetTempOff() {
      return {
        InputField_targetValue: this.instanceData.target_temp_off,
      };
    },
    inputFieldTargetTempMax() {
      return {
        InputField_targetValue: this.instanceData.target_temp_max,
      };
    },
    sliderMappings() {
      return {
        Slider_targetValue: this.instanceData.slider_manual,
      };
    },
    sliderActualValue() {
      return {
        OutputField_actualValue: this.instanceData.slider_target_power,
      };
    },
    sliderActualValueState() {
      return this.measurements.get(this.instanceData.slider_target_power);
    },
    sliderIsActive() {
      return true;
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
    switch2VActivateTimeControl() {
      return {
        Switch2V_onOff: this.instanceData.switch_time,
        Switch2V_state: this.instanceData.state_time,
      };
    },
    switch2VDisableLegionellaProtection() {
      return {
        Switch2V_onOff: this.instanceData.switch_disable_protection,
        Switch2V_state: this.instanceData.state_disable_protection,
      };
    },
    switch2VEnableHeatingElement() {
      return this.switch2VEnable;
    },
    maxPowerList() {
      return Object.keys(this.instanceData.max_power);
    },
    animatedLineMovement() {
      return typeof this.previewActualValue === "number" ? this.previewActualValue > 0 : null;
    },
  },
  created() {
    if (this.instanceData.power === "") {
      this.showOutputValue = false;
    } else {
      this.showOutputValue = true;
    }
  },
});
</script>

<style lang="scss">
.electric-heating-system-instance-view-content-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  overflow-y: auto;

  .value {
    display: flex;
    justify-content: center;
  }

  .electric-heating-slider {
    display: flex;
    flex-direction: column;
    align-items: flex-start;

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
