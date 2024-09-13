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
          <CoreRow class="big-consumer-system-instance-view-content-wrapper">
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_manual, instanceData.state_manual]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.manualON") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switchManualOn"
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
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.atEmergencyPowerOff") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switchOnEmergencyPowerOff"
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
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.enableBigConsumer") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switchEnable"
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
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.manualPower") }}
                </template>
                <template #value>
                  <div class="big-consumer-slider">
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
            <CoreColumn cols="12">
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
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.priorityEMS") }}
                </template>
                <template #unit> &#10240; </template>
              </InputFieldBase>
            </CoreColumn>
            <CoreColumn cols="12">
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
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.enableSOC") }}
                </template>
                <template #unit> % </template>
              </InputFieldBase>
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
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.disableSOC") }}
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
                :variable-data="inputFieldDisableMaxPower"
                instance="InputField"
                :with-spacer="false"
                :input-colums="2"
                :is-preview="isPreview"
              >
                <template #textDescription>
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.maxPower") }}
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
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.actualPowerBigConsumer") }}
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
                :variables-list-for-check="[instanceData.target_power]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.targetPowerBigConsumer") }}
                </template>
                <template #value>
                  <OutputFieldBase
                    :is-decimal="true"
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
                :variables-list-for-check="[instanceData.state_consumer]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.big_consumer.settings.stateBigConsumer") }}
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
 * Component that represent big-consumer system instance view.
 */
export default defineComponent({
  components: {
    FormModal,
    InputFieldBase,
    OutputFieldBase,
    SliderBase,
    ShowEventDotBase,
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
    showEventDotState() {
      return {
        ShowEventDot_errorWarningState: this.instanceData.state_consumer,
      };
    },
    switchManualOn() {
      return {
        Switch2V_onOff: this.instanceData.switch_manual,
        Switch2V_state: this.instanceData.state_manual,
      };
    },
    switchOnEmergencyPowerOff() {
      return {
        Switch2V_onOff: this.instanceData.switch_emergency,
        Switch2V_state: this.instanceData.state_emergency,
      };
    },
    switchEnable() {
      return this.switch2VEnable;
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
    inputFieldDisableMaxPower() {
      return {
        InputField_targetValue: this.instanceData.max_power,
      };
    },
    animatedLineMovement() {
      return typeof this.previewActualValue === "number" ? this.previewActualValue > 0 : null;
    },
  },
  created() {
    this.showOutputValue = this.instanceData.power !== "";
  },
});
</script>

<style lang="scss">
.big-consumer-system-instance-view-content-wrapper {
  width: 100%;

  .label {
  }

  .value {
    display: flex;
    justify-content: center;
  }

  .big-consumer-slider {
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
