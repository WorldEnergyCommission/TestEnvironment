import { defineComponent, PropType } from "vue";

import { IDevice } from "@/store/modules/devices/types";

/**
 * Boilerplate for mappings and measurements.
 * Note that VS Code rename feature doesn't work for vue mixins.
 */
export const MappingsParser = defineComponent({
  props: {
    deviceData: {
      type: Object as PropType<IDevice>,
    },
    isPreview: {
      default: false,
      type: Boolean,
    },
  },
  data() {
    return {
      /** Set instance name on the device that uses this mixin */
      instanceName: "DeviceInstanceName",
    };
  },
  computed: {
    /** Clears and returns mappings
     *
     * Example:
     * - instanceName == 'Switch'
     * - incoming variable data { Switch_on: "variable", Switch_off: "variable" }
     * - return variable data { on: "variable", off: "variable" }
     * @return {object}
     */
    parsedMappings(): any {
      if (this.instanceName === "DeviceInstanceName")
        throw new Error("Set instanceName on the device that uses MeasurementsParser mixin.");

      return Object.entries(this.deviceData?.data.mappings)
        .map(([key, value]) => {
          const [instance, variable] = key.split("_");
          return { instance, variable, value };
        })
        .filter((mapping) => mapping.instance === this.instanceName)
        .reduce(
          (obj, mapping) => ({
            ...obj,
            [mapping.variable]: mapping.value,
          }),
          {},
        );
    },
  },
});
