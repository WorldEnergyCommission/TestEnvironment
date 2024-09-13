import { defineComponent, PropType } from "vue";

import { IVariablesState } from "@/store/modules/measurements/types";
import { RootState } from "@/store/types";
import { Point, Size } from "@/ui/components/devices/components/EnergyParts/AnimatedLine/LineUtils";
import {
  EMSSystemType,
  SystemTypeString,
} from "@/ui/components/devices/devices/EnergyViewDevice/EnergyViewSystems";
import { Validation } from "@/ui/mixins/validation";

export default defineComponent({
  mixins: [Validation],
  props: {
    systemTypeString: {
      default: "grid",
      type: String as PropType<SystemTypeString | EMSSystemType>,
    },
    instanceData: Object as PropType<any>,
    instanceCanvasSize: { default: null, type: Object as PropType<Size> },
    instanceCanvasCenter: { default: null, type: Object as PropType<Point> },
    instanceLineData: { default: null, type: Object as PropType<Point> },
    instanceLineReady: { default: false, type: Boolean },
    previewTitlePosition: { default: "top", type: String },
    isPreview: { default: false, type: Boolean },
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      if (this.isPreview) {
        return { get: () => Math.round(Math.random() * 100 * 100) / 100 };
      }
      return this.measurementsState.measurements;
    },
    outputFieldActualPower() {
      return {
        OutputField_actualValue: this.instanceData.power,
      };
    },
    outputFieldTargetPower() {
      return {
        OutputField_actualValue: this.instanceData.target_power,
      };
    },
    switch2VEnable() {
      return {
        Switch2V_onOff: this.instanceData.switch_enable,
        Switch2V_state: this.instanceData.state_enable,
      };
    },
    pushButtonReset() {
      return {
        PushButton_onOff: this.instanceData.switch_reset,
        PushButton_state: this.instanceData.state_reset,
      };
    },
    showEvent() {
      return {
        ShowEvent_errorWarningState: this.instanceData.error,
      };
    },
  },
});
