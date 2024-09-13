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
          <div class="house-consumption-system-instance-view-content-wrapper">
            <LabelUnitWrapper
              :variables-list-for-check="[instanceData.switch_enable, instanceData.state_enable]"
            >
              <template #label>
                {{ $t("mlModel.EMS.systems.house.settings.enableHouseConsumption") }}
              </template>
              <template #value>
                <Switch2VBase
                  :variable-data="switch2VEnable"
                  instance="Switch2V"
                  style="margin: 0 0 0 10px"
                />
              </template>
            </LabelUnitWrapper>
            <LabelUnitWrapper :variables-list-for-check="[instanceData.power]" class="pt-2">
              <template #label>
                {{ $t("mlModel.EMS.systems.house.settings.actualHouseConsumption") }}
              </template>
              <template #value>
                <OutputFieldBase
                  :is-decimal="true"
                  :max="1000"
                  :min="-1000"
                  :variable-data="outputFieldActualHouseConsumption"
                  instance="OutputField"
                  :is-preview="isPreview"
                />
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
import OutputFieldBase from "@/ui/components/devices/devices/base/OutputFieldBase.vue";
import Switch2VBase from "@/ui/components/devices/devices/base/Switch2VBase.vue";
import InstancePreview from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstancePreview.vue";
import InstanceViewMixin from "@/ui/components/devices/mpc/EMS/components/systems/InstanceViews/InstanceViewMixin";
import EfficientIODialog from "@/ui/components/modals/EfficientIODialog.vue";

/**
 * Component that represent house system instance view.
 */
export default defineComponent({
  components: {
    EfficientIODialog,
    OutputFieldBase,
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
      return this.measurements.get(this.instanceData.power);
    },
    isNoData() {
      const type = typeof this.previewActualValue === "number";
      const zero = this.previewActualValue !== 0;
      return type && zero;
    },
    outputFieldActualHouseConsumption() {
      return {
        OutputField_actualValue: this.instanceData.power,
      };
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
.house-consumption-system-instance-view-content-wrapper {
  width: 100%;
}
</style>
