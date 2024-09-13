import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import { RootState } from "@/store/types";

/**
 * BaseDevice class.
 * Contains send method which used to send records from Basic Controls.
 * Also contains list of measurements.
 */
export default defineComponent({
  props: {
    deviceData: {
      type: Object as PropType<IDevice>,
      required: true,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      return this.measurementsState.measurements;
    },
    langPath() {
      return `devices.${this.deviceData!.data.type}`;
    },
  },
});
