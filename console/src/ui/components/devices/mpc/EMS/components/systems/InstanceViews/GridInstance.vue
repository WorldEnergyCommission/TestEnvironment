<template>
  <div class="system-instance-view">
    <EfficientIODialog :dialog-title="instanceData.title">
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
        <div class="system-instance-view-content grid-system-instance-view-content">
          <div class="grid-system-instance-view-content-wrapper">
            <InputFieldBase
              :field-rules="[
                rules.required,
                rules.fieldMoreThanOneTenth,
                rules.fieldLessThan2000,
                rules.twoComas,
              ]"
              :is-decimal="true"
              :max="1000"
              :min="0.1"
              :step="0.1"
              :variable-data="inputFieldSize"
              instance="InputField"
              :input-colums="2"
              :with-spacer="false"
              :is-preview="isPreview"
            >
              <template #textDescription>
                {{ $t("mlModel.EMS.systems.grid.settings.sizeGridConnection") }}
              </template>
              <template #unit> kW </template>
            </InputFieldBase>
            <LabelUnitWrapper
              :is-default-view="false"
              :variables-list-for-check="[instanceData.power]"
              class="pt-2"
            >
              <template #label>
                {{ $t("mlModel.EMS.systems.grid.settings.actualGridPower") }}
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
          </div>
        </div>
      </template>
    </EfficientIODialog>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import InputFieldBase from "@/ui/components/devices/devices/base/InputFieldBase.vue";
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import InstancePreview from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstancePreview.vue";
import InstanceViewMixin from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstanceViewMixin";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

/**
 * Component that represent grid system instance view.
 */
export default defineComponent({
  components: {
    EfficientIODialog,
    InputFieldBase,
    OutputFieldBase,
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
    inputFieldSize() {
      return {
        InputField_targetValue: this.instanceData.size,
      };
    },
    animatedLineMovement() {
      return typeof this.previewActualValue === "number" ? this.previewActualValue < 0 : null;
    },
  },
});
</script>

<style lang="scss">
.grid-system-instance-view-content {
  .grid-system-instance-view-content-wrapper {
    width: 100%;

    .value {
      display: flex;
      justify-content: center;
    }
  }
}
</style>
