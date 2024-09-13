<template>
  <DeviceLayout :device-data="deviceData" :is-preview="isPreview" :preview-data="deviceData">
    <template #custom-icon>
      <img
        v-if="deviceData.data.meta.cover"
        :src="`https://static.${domain}/icons/${deviceData.data.meta.cover}.svg`"
        :style="iconTheme()"
        alt="icon"
        height="30"
        width="30"
      />
    </template>
    <template #basic-controls>
      <div class="d-flex variable-output-field">
        <LabelUnitWrapper :disabled="!isActualValueVariableFilled">
          <template #value>
            <div>{{ formattedValue }}</div>
            <div class="pl-2">
              {{ unit }}
            </div>
          </template>
        </LabelUnitWrapper>
      </div>
    </template>
    <template #additional-actions>
      <div style="font-size: 0.6em">[{{ interval }}]</div>
    </template>
    <template #dnd>
      <slot name="dnd" />
    </template>
  </DeviceLayout>
</template>

<script lang="ts">
import { DebouncedFunc, throttle } from "lodash";
import moment from "moment";
import { defineComponent } from "vue";

import { IDevice } from "@/store/modules/devices/types";
import { IMeasurementGetter } from "@/store/modules/measurements/types";
import LabelUnitWrapper from "@/ui/components/devices/components/LabelUnitWrapper.vue";
import DeviceLayout from "@/ui/components/devices/layout/DefaultDeviceLayout.vue";
import { envDomain } from "@/utils/env";
import { MappingsParser } from "@/utils/MappingsParser";
import { getGuessedTimezoneAbbreviation } from "@/utils/utilsFunctions";

/**
 * Device that displays time derivation of specified measurement for selected time period.
 * Input of the device is a cummulative consumption and the device outputs current consumption per selected time period,
 * but displayed always in per hour units.
 */
export default defineComponent({
  components: {
    DeviceLayout,
    LabelUnitWrapper,
  },
  extends: MappingsParser,
  data() {
    const updateThrottle = undefined as DebouncedFunc<any> | undefined;
    const timer: any = null;
    const domain: string = envDomain;
    const value = null as number | null;

    return {
      value,
      domain,
      instanceName: "TimeDerivative",
      timer,
      updateThrottle,
    };
  },
  computed: {
    unit() {
      return this.deviceData!.data?.meta?.unit ?? "";
    },
    /**
     * Intervals on backend : ["1s", "15s", "1m", "15m", "1h", ...];
     */
    interval() {
      return this.deviceData!.data?.meta?.interval ?? "1h";
    },
    isActualValueVariableFilled() {
      return !!this.parsedMappings?.sourceVariable;
    },
    /**
     * Reactive getter for source variable
     */
    valueNotifier() {
      return this.measurement(this.parsedMappings?.sourceVariable);
    },
    formattedValue() {
      if (this.value === null) return "...";
      return this.value.toFixed(2);
    },
    measurement(): IMeasurementGetter {
      return this.$store.getters["measurements/measurement"];
    },
  },
  watch: {
    valueNotifier: [
      {
        handler: "inputsUpdatedHub",
      },
    ],
    deviceData: [
      {
        handler: "inputsUpdatedHub",
      },
    ],
  },
  mounted() {
    // needs to be assigned after mount
    this.updateThrottle = this.updateChartDataThrottleFactory();
    this.timer = setInterval(() => {
      this.updateThrottle && this.updateThrottle();
    }, 10 * 1000);
  },
  unmounted() {
    console.log("clearing interval of TimeDerivative");
    this.updateThrottle && this.updateThrottle.cancel();
    clearInterval(this.timer);
  },
  methods: {
    updateChartDataThrottleFactory() {
      return throttle(() => setTimeout(this.updateChartData, 1000), 5000);
    },
    iconTheme() {
      return { filter: this.$vuetify.theme.current.dark ? "brightness(0) invert(1)" : undefined };
    },
    async updateChartData() {
      if (this.isPreview) {
        this.value = Math.round(Math.random() * 100 * 100) / 100;
      } else {
        const result: any[][] = await this.$store.dispatch("charts/fetchChartAgg", {
          variable: this.parsedMappings?.sourceVariable,
          from: moment().subtract(2, "hours").unix(),
          to: moment().unix(),
          agg: "derivate",
          interval: this.interval,
          miss: "locf",
          tz: getGuessedTimezoneAbbreviation(),
        });
        // set value as last non-null value
        this.value =
          result
            .map((item) => item[1])
            .filter((item) => item != null)
            .slice(-1)
            .shift() ?? 0;
      }
    },
    inputsUpdatedHub() {
      this.updateThrottle && this.updateThrottle();
    },
  },
});
</script>

<style lang="scss" scoped>
@import "./src/ui/scss/mixins";

.variable-output-field {
  @include mediumText;
}
</style>
