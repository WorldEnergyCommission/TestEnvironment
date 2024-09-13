<template>
  <div class="system-instance-view">
    <FormModal :form-title="instanceData.title" window-width="800">
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
          <CoreRow class="generator-system-instance-view-content" no-gutters>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_enable, instanceData.state_enable]"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.generator.settings.enableGenerator") }}
                </template>
                <template #value>
                  <Switch2VBase
                    :variable-data="switch2VEnable"
                    instance="Switch2V"
                    style="margin: 0 0 0 10px"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.switch_reset, instanceData.state_reset]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.generator.settings.reset") }}
                </template>
                <template #value>
                  <PushButtonBase
                    :variable-data="pushButtonReset"
                    button-size="35"
                    icon="push_reset"
                    icon-size="25"
                    instance="PushButton"
                  />
                </template>
              </LabelUnitWrapper>
            </CoreColumn>
            <CoreColumn cols="12">
              <div class="pt-2">
                <InputFieldBase
                  :description-styles="{ paddingTop: '5px' }"
                  :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                  :is-decimal="false"
                  :max="100"
                  :min="0"
                  :step="1"
                  :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                  :variable-data="inputFieldEnableSOCMappings"
                  instance="InputField"
                  :with-spacer="$vuetify.display.mobile"
                  :is-preview="isPreview"
                >
                  <template #textDescription>
                    {{ $t("mlModel.EMS.systems.generator.settings.enableSOC") }}
                  </template>
                  <template #unit> % </template>
                </InputFieldBase>
              </div>
            </CoreColumn>
            <CoreColumn cols="12">
              <div class="pt-2">
                <InputFieldBase
                  :description-styles="{ paddingTop: '5px' }"
                  :field-rules="[rules.required, rules.fieldMoreThanNull, rules.fieldLessThan100]"
                  :is-decimal="false"
                  :max="100"
                  :min="0"
                  :step="1"
                  :unit-styles="{ flexGrow: '1', textAlign: 'center', paddingTop: '5px' }"
                  :variable-data="inputFieldDisableSOCMappings"
                  instance="InputField1"
                  :with-spacer="$vuetify.display.mobile"
                  :is-preview="isPreview"
                >
                  <template #textDescription>
                    {{ $t("mlModel.EMS.systems.generator.settings.disableSOC") }}
                  </template>
                  <template #unit> % </template>
                </InputFieldBase>
              </div>
            </CoreColumn>
            <CoreColumn cols="12">
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.power]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.generator.settings.actualGeneratorPower") }}
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
            <CoreColumn>
              <LabelUnitWrapper
                :is-default-view="false"
                :variables-list-for-check="[instanceData.state_generator]"
                class="pt-2"
              >
                <template #label>
                  {{ $t("mlModel.EMS.systems.generator.settings.stateGenerator") }}
                </template>
                <template #value>
                  <ShowEventDotBase
                    :items="[[1, $vuetify.theme.current.colors.green]]"
                    :variable-data="showEventDotMappings"
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
import PushButtonBase from "@/ui/components/devices/devices/base/PushButtonBase/index.vue";
import ShowEventDotBase from "@/ui/components/devices/devices/base/ShowEventDotBase.vue";
import Switch2VBase from "@/ui/components/devices/devices/base/Switch2VBase.vue";
import InstancePreview from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstancePreview.vue";
import InstanceViewMixin from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstanceViewMixin";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that represent generator system instance view.
 */
export default defineComponent({
  components: {
    FormModal,
    PushButtonBase,
    ShowEventDotBase,
    InputFieldBase,
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
    showEventDotMappings() {
      return {
        ShowEventDot_errorWarningState: this.instanceData.state_generator,
      };
    },
    inputFieldEnableSOCMappings() {
      return {
        InputField_targetValue: this.instanceData.enable_soc,
      };
    },
    inputFieldDisableSOCMappings() {
      return {
        InputField1_targetValue: this.instanceData.disable_soc,
      };
    },
    animatedLineMovement() {
      return typeof this.previewActualValue === "number" ? this.previewActualValue < 0 : null;
    },
  },
});
</script>

<style lang="scss">
.generator-system-instance-view-content {
  width: 100%;

  .label {
    width: 350px;
  }

  .value {
    display: flex;
    justify-content: center;
  }
}
</style>
