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
          <CoreRow class="heating-pump-system-instance-view-content-wrapper">
            <CoreColumn cols="12" md="6">
              <InputFieldBase
                :field-rules="[rules.required, rules.fieldHours, rules.fieldMoreThanNull]"
                :is-decimal="false"
                :max="23"
                :min="0"
                :step="1"
                :variable-data="inputFieldHourOn"
                instance="InputField"
                :with-spacer="false"
                :input-colums="2"
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
                :field-rules="[rules.required, rules.fieldMinutes, rules.fieldMoreThanNull]"
                :is-decimal="false"
                :max="59"
                :min="0"
                :step="1"
                :variable-data="inputFieldMinOn"
                instance="InputField"
                :with-spacer="false"
                :input-colums="2"
                :is-preview="isPreview"
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
                :field-rules="[rules.required, rules.fieldHours, rules.fieldMoreThanNull]"
                :is-decimal="false"
                :max="23"
                :min="0"
                :step="1"
                :variable-data="inputFieldHourOff"
                instance="InputField"
                :with-spacer="false"
                :input-colums="2"
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
                :field-rules="[rules.required, rules.fieldMinutes, rules.fieldMoreThanNull]"
                :is-decimal="false"
                :max="59"
                :min="0"
                :step="1"
                :variable-data="inputFieldMinOff"
                instance="InputField"
                :with-spacer="false"
                :input-colums="2"
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
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.power]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.actualPowerHeatingPump") }}
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
                :variables-list-for-check="[instanceData.flow_temperature]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.flowTemperature") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="120"
                    :min="-30"
                    :variable-data="outputFieldFlowTemperature"
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
                :variables-list-for-check="[instanceData.return_temperature]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.returnTemperature") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="120"
                    :min="-30"
                    :variable-data="outputFieldReturnTemperature"
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
                :variables-list-for-check="[instanceData.inlet_temperature]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.sourceInletTemperature") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="120"
                    :min="-30"
                    :variable-data="outputFieldSourceInlet"
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
                :variables-list-for-check="[instanceData.outlet_temperature]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.sourceOutletTemperature") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="120"
                    :min="-30"
                    :variable-data="outputFieldSourceOutlet"
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
                :variables-list-for-check="[instanceData.boiler_temperature]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.boilerTempHeatingSystem") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="120"
                    :min="-30"
                    :variable-data="outputFieldBoilerTempHeatingSystem"
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
                :variables-list-for-check="[instanceData.boiler_water_temperature]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.boilerTempServiceWater") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="120"
                    :min="-30"
                    :variable-data="outputFieldBoilerTempServiceWater"
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
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.targetPowerHeatingPump") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
                    :max="100"
                    :min="0"
                    :variable-data="outputFieldTargetPowerHeatingPump"
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
                :variables-list-for-check="[instanceData.state_heating_pump]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.stateHeatingPump") }}
                </template>
                <template #value>
                  <ShowEventDotBase
                    :items="[[1, $vuetify.theme.current.colors.green]]"
                    :variable-data="showEventDotState"
                    height="15"
                    instance="ShowEventDot"
                    width="15"
                    :is-preview="isPreview"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_manual, instanceData.state_manual]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.manualON") }}
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
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.atEmergencyPowerOff") }}
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
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.activateTimeControl") }}
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
                :variables-list-for-check="[instanceData.switch_enable, instanceData.state_enable]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.enableHeatingPump") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switch2VEnableHeatingPump"
                    instance="Switch2V"
                    style="margin: 0 0 0 10px"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_reset, instanceData.state_reset]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.reset") }}
                </template>
                <template #value>
                  <PushButtonBase
                    :variable-data="pushButtonReset"
                    button-size="35"
                    icon="push_reset"
                    icon-size="25"
                    instance="PushButton"
                    :is-preview="isPreview"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.manual_power, instanceData.slider_manual]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.manualPower") }}
                </template>
                <template #value>
                  <div class="heating-pump-slider">
                    <div class="slider-actual-value">
                      <OutputFieldBase
                        :variable-data="slider1ActualValue"
                        instance="OutputField"
                        :is-preview="isPreview"
                      />
                      <div>%</div>
                    </div>
                    <div class="slider">
                      <SliderBase
                        :is-active="slider1IsActive"
                        :state="slider1ActualValueState"
                        :variable-data="slider1Mappings"
                        instance="Slider"
                        :is-preview="isPreview"
                      />
                    </div>
                  </div>
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[
                  instanceData.state_time_power,
                  instanceData.slider_power,
                ]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.powerWhenTimeControlActive") }}
                </template>
                <template #value>
                  <div class="heating-pump-slider">
                    <div class="slider-actual-value">
                      <OutputFieldBase
                        :variable-data="slider2ActualValue"
                        instance="OutputField"
                        :is-preview="isPreview"
                      />
                      <div>%</div>
                    </div>
                    <div class="slider">
                      <SliderBase
                        :is-active="slider2IsActive"
                        :state="slider2ActualValueState"
                        :variable-data="slider2Mappings"
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
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.priorityEMS") }}
                </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
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
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.enableSOC") }}
                </template>
                <template #unit> % </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12" md="6">
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
                  {{ $t("mlModel.EMS.systems.heating_pump.settings.disableSOC") }}
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
                  :field-rules="[
                    rules.required,
                    rules.fieldMoreThanNull,
                    rules.twoComas,
                    rules.fieldLessThan500,
                  ]"
                  :is-decimal="true"
                  :max="500"
                  :min="0"
                  :step="0.01"
                  :variable-data="{ InputField_targetValue: instanceData.max_power[mpItem] }"
                  instance="InputField"
                  :with-spacer="false"
                  :input-colums="2"
                  :is-preview="isPreview"
                >
                  <template #textDescription>
                    {{ $t("mlModel.EMS.systems.heating_pump.settings.maxPower") }} ({{
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
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import SliderBase from "@/ui/components/devices/devices/base/SliderBase.vue";
import Switch2VBase from "@/ui/components/devices/devices/base/Switch2VBase.vue";
import InstancePreview from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstancePreview.vue";
import InstanceViewMixin from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstanceViewMixin";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that represent heating pump system instance view.
 */
export default defineComponent({
  components: {
    FormModal,
    OutputFieldBase,
    ShowEventDotBase,
    PushButtonBase,
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
    measurements() {
      return this.measurementsState.measurements;
    },
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
    showEventDotState() {
      return {
        ShowEventDot_errorWarningState: this.instanceData.state_heating_pump,
      };
    },
    outputFieldFlowTemperature() {
      return {
        OutputField_actualValue: this.instanceData.flow_temperature,
      };
    },
    outputFieldReturnTemperature() {
      return {
        OutputField_actualValue: this.instanceData.return_temperature,
      };
    },
    outputFieldSourceInlet() {
      return {
        OutputField_actualValue: this.instanceData.inlet_temperature,
      };
    },
    outputFieldSourceOutlet() {
      return {
        OutputField_actualValue: this.instanceData.outlet_temperature,
      };
    },
    outputFieldBoilerTempHeatingSystem() {
      return {
        OutputField_actualValue: this.instanceData.boiler_temperature,
      };
    },
    outputFieldBoilerTempServiceWater() {
      return {
        OutputField_actualValue: this.instanceData.boiler_water_temperature,
      };
    },
    outputFieldTargetPowerHeatingPump() {
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
    slider1Mappings() {
      return {
        Slider_targetValue: this.instanceData.slider_manual,
      };
    },
    slider1ActualValue() {
      return {
        OutputField_actualValue: this.instanceData.manual_power,
      };
    },
    slider1ActualValueState() {
      return this.measurements.get(this.instanceData.manual_power);
    },
    slider1IsActive() {
      return true;
    },
    slider2Mappings() {
      return {
        Slider_targetValue: this.instanceData.slider_power,
      };
    },
    slider2ActualValue() {
      return {
        OutputField_actualValue: this.instanceData.state_time_power,
      };
    },
    slider2ActualValueState() {
      return this.measurements.get(this.instanceData.state_time_power);
    },
    slider2IsActive() {
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
    switch2VActivateTimeControl() {
      return {
        Switch2V_onOff: this.instanceData.switch_time,
        Switch2V_state: this.instanceData.state_time,
      };
    },
    switch2VEnableHeatingPump() {
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
.heating-pump-system-instance-view-content-wrapper {
  width: 100%;
  display: flex;
  justify-content: space-between;
  max-height: 700px;
  overflow-y: auto;

  .left-side {
    width: 49%;
  }

  .right-side {
    width: 49%;
  }

  .value {
    display: flex;
    justify-content: center;
  }

  .heating-pump-slider {
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
