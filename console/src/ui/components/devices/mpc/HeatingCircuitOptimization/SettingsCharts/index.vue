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
          <component :is="item.component" :device-id="item.deviceData" :is-preview="isPreview" />
        </div>
      </CoreWindowItem>
    </CoreWindow>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import Charts from "@/ui/components/devices/mpc/HeatingCircuitOptimization/SettingsCharts/Charts.vue";
import Forecast from "@/ui/components/devices/mpc/HeatingCircuitOptimization/SettingsCharts/Forecast.vue";

/**
 * Component that represent wrapper for charts tabs navigation.
 * Used in HeatingCircuitOptimization.
 */
export default defineComponent({
  name: "SettingsCharts",
  components: {
    Forecast,
    Charts,
  },
  props: {
    deviceId: String,
    isPreview: { default: false, type: Boolean },
  },
  data() {
    const tab: any = null;

    return {
      tab,
    };
  },
  computed: {
    langPath() {
      return "mlModel.HeatingCircuitOptimization.settingsView.chartTabs";
    },
    tabs() {
      return [
        {
          title: "Chart",
          locale: this.langPath,
          component: "Charts",
          deviceData: this.deviceId,
        },
        {
          title: "Forecast",
          locale: this.langPath,
          component: "Forecast",
          deviceData: this.deviceId,
        },
      ];
    },
  },
});
</script>

<style lang="scss"></style>
