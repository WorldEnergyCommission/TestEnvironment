import { defineComponent, PropType } from "vue";

import { IRecord } from "@/store/modules/devices/types";
import { RootState } from "@/store/types";

/**
 * BaseDevice class.
 * Contains send method which used to send records from Basic Controls.
 * Also contains list of measurements.
 */
export default defineComponent({
  props: {
    variableData: {
      type: Object as PropType<Record<string, string>>,
    },
    instance: {
      type: String,
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    /**
     * Clears variableData keys from Basic control name
     * Example:
     * - incoming variable data { Switch_on: "variable", Switch_off: "variable" }
     * - return variable data { on: "variable", off: "variable" }
     * @return {object}
     */
    measurementsClean(): Record<string, string> {
      if (!this.variableData) return {};
      return Object.entries(this.variableData)
        .map(([key, value]) => {
          const [instance, variable] = key.split(/_(.*)/s);
          return { instance, variable, value };
        })
        .filter((mapping) => mapping.instance === this.instance)
        .reduce(
          (obj, mapping) => ({
            ...obj,
            [mapping.variable]: mapping.value,
          }),
          {},
        );
    },
    measurementsState() {
      return (this.$store.state as RootState).measurements;
    },
    measurements() {
      if (this.isPreview) {
        return { get: () => Math.round(Math.random() * 100 * 100) / 100 };
      }

      return this.measurementsState.measurements;
    },
  },
  methods: {
    async send(data: IRecord[]) {
      // eslint-disable-next-line no-restricted-syntax
      for (const d of data) {
        // eslint-disable-next-line no-await-in-loop
        await this.$store.dispatch("measurements/publishMeasurement", d);
      }
    },
  },
});
