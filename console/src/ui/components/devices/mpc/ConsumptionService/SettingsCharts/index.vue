<template>
  <div>
    <CoreTabs v-model="tab" fixed-tabs>
      <CoreTab v-for="(item, index) in tabs" :key="index">
        {{ $rt(($tm(item.locale) as any)[index]) }}
      </CoreTab>
    </CoreTabs>

    <CoreWindow v-model="tab">
      <CoreWindowItem v-for="(item, index) in tabs" :key="index">
        <div v-if="index === tab">
          <!-- chart view -->
          <component
            :is="item.component"
            :charts-scaling="chartsScaling"
            :mpc-id="mpcId"
            :mqtt-charts-variables="mqttChartsVariables"
            :is-preview="isPreview"
          />
        </div>
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

import Charts from "@/ui/components/devices/mpc/ConsumptionService/SettingsCharts/Charts.vue";
import Forecast from "@/ui/components/devices/mpc/ConsumptionService/SettingsCharts/Forecast.vue";

/**
 * Component that represent wrapper for charts tabs navigation.
 * Used in ConsumptionService.
 */
export default defineComponent({
  name: "SettingsCharts",
  components: {
    Forecast,
    Charts,
  },
  props: {
    mpcId: [Object, String],
    chartsScaling: [Object, Number, String],
    isPreview: { default: false, type: Boolean },
    mqttChartsVariables: {
      default: () => ({
        actualPower: "",
        calculatedPower: null,
        calculatedEnergy: null,
      }),
      type: Object as PropType<any>,
    },
  },
  data() {
    const tab: any = null;

    return {
      tab,
    };
  },
  computed: {
    langPath() {
      return "mlModel.ConsumptionService.settingsView.chartTabs";
    },
    tabs() {
      return [
        {
          title: "chart",
          locale: this.langPath,
          component: "Charts",
          chartsScaling: this.chartsScaling,
          mqttChartsVariables: this.mqttChartsVariables,
        },
        {
          title: "forecast",
          locale: this.langPath,
          component: "Forecast",
          chartsScaling: this.chartsScaling,
          mpcId: this.mpcId,
        },
      ];
    },
  },
});
</script>

<style lang="scss"></style>
