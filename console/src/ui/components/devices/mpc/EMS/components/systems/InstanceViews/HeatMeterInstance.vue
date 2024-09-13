<template>
  <div class="system-instance-view">
    <EfficientIODialog :dialog-title="instanceData.title">
      <template #activator>
        <InstancePreview
          :system-type-string="systemTypeString"
          :preview-actual-value="previewActualValue"
          :output-field-actual-power="previewActualValue"
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
          <div class="house-consumption-system-instance-view-content-wrapper">
            <LabelUnitWrapper class="pt-2">
              <template #value>
                {{ previewActualValue }}
                <div class="pl-2 pr-3">kW</div>
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
import InstancePreview from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstancePreview.vue";
import InstanceViewMixin from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstanceViewMixin";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

/**
 * Component that represent heat meter system instance view.
 */
export default defineComponent({
  components: {
    EfficientIODialog,
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

<style lang="scss">
.house-consumption-system-instance-view-content-wrapper {
  width: 100%;
}
</style>
