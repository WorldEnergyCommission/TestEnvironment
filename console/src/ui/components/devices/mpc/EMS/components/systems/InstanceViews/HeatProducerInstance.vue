<template>
  <div class="system-instance-view">
    <FormModal :form-title="instanceData.title" window-width="580">
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
    </FormModal>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import InstancePreview from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstancePreview.vue";
import InstanceViewMixin from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstanceViewMixin";
import FormModal from "@/ui/components/modals/FormModal.vue";

/**
 * Component that represent heat producer system instance view.
 */
export default defineComponent({
  components: {
    FormModal,
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
