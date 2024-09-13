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
        <div class="system-instance-view-content">
          <div style="width: 100%">
            <LabelUnitWrapper :variables-list-for-check="[instanceData.power]">
              <template #label>
                {{ $t("mlModel.EMS.systems.pv.settings.actualPower") }}
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
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import InstancePreview from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstancePreview.vue";
import InstanceViewMixin from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstanceViewMixin";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

/**
 * Component that represent pv-system instance view.
 */
export default defineComponent({
  components: {
    EfficientIODialog,
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
    animatedLineMovement() {
      return typeof this.previewActualValue === "number" ? this.previewActualValue < 0 : null;
    },
  },
});
</script>
